/**
 * Created by kjtdi on 1/30/2017.
 */
var express = require('express');
var _ = require('lodash');
var router = express.Router();
var models = require('./../models');
var sequelize = models.sequelize;
var fs = require('fs');
var path = require('path');
var moment = require('moment');
var async = require('async');

/* Retrieve all items from database */
router.get('/viewall', function (req, res) {
    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var News = models.News;
            var User = models.User;
            News.findAndCountAll({
                limit: 3,
                offset: parseInt(req.params.start),
                include: [User],
                order: '`id` DESC'
            }).then(function (News) {
                //saving news array to a session and redirect
                req.session.newsOffset = parseInt(req.params.start);
            });
        }
    );
});

//store item in database
router.post('/add', function (req, res) {
    //retrive data from reqeust header
    var quantity = req.body.quantity;
    var title = req.body.title;
    var deliveryBy = req.body.deliveryBy;
    var WareHouseId = req.body.warehouseId;
    var packingType = req.body.packingType;
    var paymentTerms = req.body.paymentTerms;
    var suggestedPrice = req.body.suggestedPrice;
    var sellerNote = req.body.sellerNote;
    var duration = req.body.duration;
    var CommodityId = req.body.commodityId;
    var UserId = req.body.userId;

    //write images to image files
    _.forEach(req.body.images, function(image, index) {
        var imageBuffer = decodeBase64Image(image.data); //decoding base64 images
        fs.writeFile('public/uploads/items/'+image.filename, imageBuffer.data, function(err) {
            console.log(err);
        });
    });

    //store item in database
    sequelize.sync().then(
        function () {
            var Item = models.Item;
            Item.create({
                title: title,
                quantity: quantity,
                deliveryBy: deliveryBy,
                WareHouseId: WareHouseId,
                packageType: packingType,
                paymentTerms: paymentTerms,
                suggestedPrice: suggestedPrice,
                note: sellerNote,
                duration: duration,
                CommodityId: CommodityId,
                UserId: UserId,
            }).then(function (insertedItem) {
                console.log(insertedItem);
                var insertedItemId = insertedItem.dataValues.id;
                //store item images
                var ItemImage = models.ItemImage;
                _.forEach(req.body.images, function(image, index) {
                    ItemImage.create({
                        url: image.filename,
                        ItemId: insertedItemId,
                    });
                });
            }).then(function () {
                res.sendStatus(200);
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});


/* Retrieve latest items from database */
/* Usage: Home Page */
router.get('/viewlatest', function (req, res) {
    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var Item = models.Item;
            var ItemImage = models.ItemImage;
            var Commodity = models.Commodity;
            Item.findAndCountAll({
                where: {duration: {
                    gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))
                }},
                limit: 10,
                include: [ItemImage, Commodity],
                order: '`id` DESC'
            }).then(function (Items) {
                var itemsArr = [];
                //pushing retrieved data to commodity array
                _.forEach(Items.rows, function(item, index) {
                    var id = item.id;
                    var title = item.title;
                    var quantity = item.quantity;
                    var duration = item.duration;
                    var suggestedPrice = item.suggestedPrice;

                    itemsArr.push({'title': title, 'id': id, 'quantity': quantity, 'suggestedPrice': suggestedPrice,
                        'images': item.ItemImages, 'commodity': item.Commodity});
                });
                req.session.latestItems = itemsArr;
                res.redirect('/');
            });
        }
    );
});

/* Retrieve items for search from database */
/* Usage: Home Page */
/* Usage: Search Results Page */
router.get('/search/start/:start', function (req, res) {
    var keyword = req.query['keyword'] ? req.query['keyword'] : req.session.keyword;
    var start = req.params.start;
    var class_ = req.query['class'] ? req.query['class'] : req.session.selectedClass;
    var segment = req.query['segment'] ? req.query['segment'] : req.session.selectedSegment;
    var startPrice = req.query['startPrice'] ? req.query['startPrice'] : req.session.startPrice;

    //check whether checkbox is already ticked or not
    if(req.query['class'] == req.session.selectedClass) {
        class_ = null;
        delete req.session.selectedClass;
    }

    //check whether checkbox is already ticked or not
    if(req.query['segment'] == req.session.selectedSegment) {
        segment = null;
        delete req.session.selectedSegment;
    }

    //define where object of sequelize object according to parameter selected in search results page
    var whereObject = {
        duration: {
            gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))
        },
        $or: [
            {'$Commodity.name$': {$like: '%'+keyword+'%'}},
            {title: {$like: '%'+keyword+'%'}}
        ],
    };
    if(class_ != null && class_ != undefined) {
        whereObject["$Commodity.class$"] = {$like: '%'+class_+'%'};
        req.session.selectedClass = class_;
    }
    if (segment != null && segment != undefined) {
        whereObject["$Commodity.segment$"] = {$like: '%'+segment+'%'};
        req.session.selectedSegment = segment;
    }

    //Filter by price range
    if(startPrice != null && startPrice != undefined) {
        var endPrice = req.query['endPrice'] ? req.query['endPrice'] : req.session.endPrice;
        whereObject['suggestedPrice'] = {$between: [parseFloat(startPrice), parseFloat(endPrice)]};
        req.session.startPrice = startPrice;
        req.session.endPrice = endPrice;
    }

    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var Item = models.Item;
            var Commodity = models.Commodity;
            var ItemImage = models.ItemImage;
            var User = models.User;
            Item.findAndCountAll({
                where: whereObject,
                subQuery:false,
                include: [Commodity, ItemImage, User],
                order: '`id` DESC',
                limit: 10,
                offset: parseInt(start),
            }).then(function (Items) {
                if(start == 0 && (keyword != null && keyword != undefined) &&
                    ((class_ == null || class_ == undefined) && (segment == null || segment == undefined))) {
                    /* Waterfall is needed since below two functions are db functions */
                    async.waterfall([
                            function (callback) {
                                //Identify distinct characteristics of commodities according to keyword search
                                /*Usage: sidebar of search result page */
                                var segments = [];
                                var classes = [];
                                sequelize.sync().then(
                                    function () {
                                        var Item = models.Item;
                                        var Commodity = models.Commodity;
                                        Item.aggregate('segment', 'DISTINCT',{
                                            plain: false,
                                            where: {
                                                duration: {
                                                    gte: sequelize.fn("TIME_TO_SEC",
                                                        sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))
                                                },
                                                $or: [
                                                    {'$Commodity.name$': {$like: '%'+keyword+'%'}},
                                                    {title: {$like: '%'+keyword+'%'}}
                                                ],
                                            },
                                            include: [Commodity],
                                            group: ['segment'],
                                        }).then(function (Segments) {
                                            _.forEach(Segments, function(segment, index) {
                                                segments.push(segment.DISTINCT);
                                            });

                                            Item.aggregate('class', 'DISTINCT',{
                                                plain: false,
                                                where: {
                                                    duration: {
                                                        gte: sequelize.fn("TIME_TO_SEC",
                                                            sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))
                                                    },
                                                    $or: [
                                                        {'$Commodity.name$': {$like: '%'+keyword+'%'}},
                                                        {title: {$like: '%'+keyword+'%'}}
                                                    ],
                                                },
                                                include: [Commodity],
                                                group: ['class'],
                                            }).then(function (Classes) {
                                                _.forEach(Classes, function(class_, index) {
                                                    classes.push(class_.DISTINCT);
                                                });
                                                req.session.distinctCharacteristics = [segments, classes];
                                                callback(null, keyword, req);
                                            });
                                        });
                                    }
                                );
                            },
                            function (keyword, req, callback) {
                                //retrieve max price of the search results
                                /*Usage: sidebar of search result page */
                                sequelize.sync().then(
                                    function () {
                                        var Item = models.Item;
                                        var Commodity = models.Commodity;
                                        Item.aggregate('suggestedPrice', 'MAX',{
                                            plain: false,
                                            where: {
                                                duration: {
                                                    gte: sequelize.fn("TIME_TO_SEC",
                                                        sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))
                                                },
                                                $or: [
                                                    {'$Commodity.name$': {$like: '%'+keyword+'%'}},
                                                    {title: {$like: '%'+keyword+'%'}}
                                                ],
                                            },
                                            include: [Commodity],
                                        }).then(function (Price) {
                                            req.session.maxPrice =  Price[0].MAX;
                                            callback(null,req);
                                        });
                                    }
                                );
                            }],
                        function (err, req) {
                            req.session.itemsCount = Items.count;
                            req.session.itemsOffset = parseInt(req.params.start);
                            req.session.keyword = keyword;
                            req.session.searchResult = Items.rows;

                            //calculate remaining times for biddings
                            var currentTime = new Date().getTime() / 1000;
                            var remainingTimes = []
                            _.forEach(Items.rows, function(item, index) {
                                //calculate remaining time
                                var difference = ((item.createdAt.getTime() / 1000) + item.duration) - currentTime;
                                remainingTimes.push(difference);
                            });
                            req.session.searchResultRemainingTime = remainingTimes;

                            res.redirect('/items');
                        }
                    );
                } else {
                    req.session.searchResult = Items.rows;
                    res.redirect('/items');
                }

            });
        }
    );
});

/* Retrieve items for search from database. use selected class of commodity */
/* Usage: Search Results Page */
router.post('/search/class', function (req, res) {
    var class_ = req.body.class;
    var start = req.body.start;

    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var Item = models.Item;
            var Commodity = models.Commodity;
            var ItemImage = models.ItemImage;
            var User = models.User;
            Item.findAndCountAll({
                where: {
                    duration: {
                        gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))
                    },
                    '$Commodity.class$': {$like: '%'+class_+'%'},
                },
                subQuery:false,
                include: [Commodity, ItemImage, User],
                order: '`id` DESC',
                limit: 10,
                offset: parseInt(start),
            }).then(function (Items) {
                req.session.selectedClass = class_;
                req.session.searchResult = Items.rows;
                res.redirect('/items')
            });
        }
    );
});


/* Retrieve items for search from database. use selected segment of commodity */
/* Usage: Serach Result Page */
router.post('/search/segment', function (req, res) {
    var segment = req.body.segment;
    var start = req.body.start;

    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var Item = models.Item;
            var Commodity = models.Commodity;
            var ItemImage = models.ItemImage;
            var User = models.User;
            Item.findAndCountAll({
                where: {
                    duration: {
                        gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))
                    },
                    '$Commodity.segment$': {$like: '%'+segment+'%'},
                },
                subQuery:false,
                include: [Commodity, ItemImage, User],
                order: '`id` DESC',
                limit: 10,
                offset: parseInt(start),
            }).then(function (Items) {
                req.session.selectedSegment = segment;
                req.session.searchResult = Items.rows;
                res.redirect('/items')
            });
        }
    );
});

/* Retrieve all results for search key word.*/
/* Usage: Main Menu */
router.post('/keyword', function (req, res) {
    //extract keyword of commodity from req body
    var keyword = req.body.keyword;

    //retrieve data from req object
    sequelize.sync().then(
        function () {
            //search items which include keyword
            var Item = models.Item;
            Item.findAll({
                where: {
                    title: {
                        $like: '%'+keyword+'%',
                    },
                    duration: {
                        gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))
                    },
                },
                order: '`id` DESC',
            }).then(function (Items) {
                //search for commodities which include the keywords
                var Commodity = models.Commodity;
                Commodity.findAll({
                    where: {
                        name: {
                            $like: '%'+keyword+'%',
                        }

                    },
                }).then(function (Commodities) {
                    //put search results grab from items and commodities and pass as json object
                    var searchResults = [Items, Commodities];
                    res.jsonp(searchResults);
                });
            });
        }
    );
});

/* Retrieve specific item and its comments from database */
/* Usage: Search Page */
router.get('/id/:id', function (req, res) {
    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var Item = models.Item;
            var User = models.User;
            var ItemImage = models.ItemImage;
            var ItemComment = models.ItemComment;
            var Commodity = models.Commodity;
            var WareHouse = models.WareHouse;

            var itemId = req.params.id;
            Item.findAll({
                where: {id: itemId},
                include: [User, ItemImage, Commodity, WareHouse],
            }).then(function (Items) {
                var item = Items[0].dataValues;
                var id = item.id;
                var hits = item.hits;
                var user = item.User;
                var itemImages = item.ItemImages;
                var commodity = item.Commodity;
                var warehouse = item.WareHouse;

                //calculate remaining time
                var currentTime = new Date().getTime() / 1000;
                var difference = ((item.createdAt.getTime() / 1000) + item.duration) - currentTime;

                //retrieve similar items
                Item.findAll({
                    where: {
                        CommodityId: item.CommodityId,
                        duration: {
                            gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))
                        },
                        id: {
                            $ne: id,
                        }
                    },
                    include: [ItemImage],
                }).then(function (Items) {
                    var similarItems = Items;

                    ItemComment.findAll({
                        where: {
                            ItemId: id,
                        },
                        include: [User],
                    }).then(function (Comments) {
                        req.session.specificBiddingItem = {'item': item, 'commodity': commodity, 'itemImages': itemImages,
                            'user': user, 'itemComments': Comments, 'warehouse': warehouse, 'remainingTime': difference,
                            'similarItems': similarItems};

                        Item.update(
                            { hits: (hits+1) },
                            { where: { id: id } }
                        ).then(function (results) {
                            res.redirect('/items/id/'+itemId);
                        });
                    });
                });
            });
        }
    );
});

/* Add feedback to database. */
router.post('/feedback', function (req, res) {
    //retrieve data from req object
    var userId = req.body.userId;
    var rating = req.body.rating;
    var feedback = req.body.feedback;
    var itemId = req.body.id;

    //store news in database
    sequelize.sync().then(
        function () {
            var ItemComment = models.ItemComment;
            ItemComment.create({
                rate: rating,
                comment: feedback,
                ItemId: itemId,
                UserId: userId,
            }).then(function (insertedComment) {
                console.log(insertedComment.dataValues);
            });
        }
    ).catch(function (error) {
        console.log(error);
    });

    res.redirect('/items/id/'+itemId);
});

//function to decode base64 image
function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}

module.exports = router;