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
var forEach = require('async-foreach').forEach;

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
              title: req.body.title,
              quantityMin: req.body.quantityMin,
              quantityMax: req.body.quantityMax,
              measureUnit: req.body.measureUnit,
              packageType: req.body.packingType,
              priceUnit: req.body.priceUnit,
              note: req.body.producer_note,
              status: 'pending',
              loadTime: req.body.loadTime,
              thumbnail: req.body.images[0].filename,
              origin: req.body.origin,
              commodityDesc: req.body.comDesc,
              CommodityId: req.body.commodityId,
              UserId: req.body.userId,
              suggestedPrice: req.body.fob_price,
              hits: 0,
            }).then(function (insertedItem) {
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


//update item in database
router.post('/update', function (req, res) {
    //retrive data from reqeust header
    var quantity = req.body.quantity;
    var measureUnit = req.body.measureUnit;
    var title = req.body.title;
    var deliveryBy = req.body.deliveryBy;
    var WareHouseId = req.body.warehouseId;
    var packingType = req.body.packingType;
    var paymentTerms = req.body.paymentTerms;
    var suggestedPrice = req.body.suggestedPrice;
    var sellerNote = req.body.sellerNote;
    var duration = req.body.duration;
    var itemId = req.body.itemId;

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
            Item.update(
                {
                    title: title,
                    quantity: quantity,
                    measureUnit: measureUnit,
                    deliveryBy: deliveryBy,
                    WareHouseId: WareHouseId,
                    packageType: packingType,
                    paymentTerms: paymentTerms,
                    suggestedPrice: suggestedPrice,
                    note: sellerNote,
                    duration: duration
                },
                {where: { id: itemId }}
            ).then(function (updatedItem) {
                var updatedItemId = itemId;
                //store item images
                var ItemImage = models.ItemImage;
                _.forEach(req.body.images, function(image, index) {
                    ItemImage.create({
                        url: image.filename,
                        ItemId: updatedItemId,
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
                where: {
                    // duration: {gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))},
                    status:'pending',
                },
                limit: 10,
                include: [ItemImage, Commodity],
                order: '`createdAt` DESC'
            }).then(function (Items) {
                var itemsArr = [];
                //pushing retrieved data to commodity array
                console.log('Visited latest item');
                _.forEach(Items.rows, function(item, index) {
                    console.log('Visited latest item '+index);
                    var id = item.id;
                    var title = item.title;
                    var quantity = item.quantity;
                    var duration = item.duration;
                    var suggestedPrice = item.suggestedPrice;

                    itemsArr.push({'title': title, 'id': id, 'quantity': quantity, 'suggestedPrice': suggestedPrice,
                        'images': item.ItemImages, 'commodity': item.Commodity});
                });
                console.log('Visited latest item finished');
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
    retrieveItems(req, res, keyword);
});

/* Retrieve items for search from database */
/* Usage: Heading Menu. Category Search*/
router.get('/search/start/:start/keyword/:keyword', function (req, res) {
    var keyword = req.params.keyword ? req.params.keyword : req.session.keyword;
    retrieveItems(req, res, keyword);
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
router.get('/id/:id/userId/:userId', function (req, res) {
    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var Item = models.Item;
            var User = models.User;
            var ItemImage = models.ItemImage;
            var Commodity = models.Commodity;
            var WareHouse = models.WareHouse;
            var CommodityMeasureUnit = models.CommodityMeasureUnit;
            var CommodityPriceUnit = models.CommodityPriceUnit;
            var CommodityPacking = models.CommodityPacking;

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
                        // duration: {
                        //     gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))
                        // },
                        id: {
                            $ne: id,
                        }
                    },
                    include: [ItemImage, User],
                }).then(function (Items) {
                    var similarItems = Items;

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
                            include: [ItemImage, User],
                        }).then(function (Items) {

                            //retreive measure units
                            CommodityMeasureUnit.findAll({
                                where: {CommodityId: commodity.id}
                            }).then(function (MeasuerUnits) {
                                //retrieve price units
                                CommodityPriceUnit.findAll({
                                    where: {CommodityId: commodity.id}
                                }).then(function (PriceUnits) {

                                    CommodityPacking.findAll({
                                        where: {CommodityId: commodity.id}
                                    }).then(function (PackingTypes) {
                                        models.Email.findAll({
                                            limit: 1,
                                            where: {UserId: user.id},
                                        }).then(function (Emails) {
                                            models.PhoneNumber.findAll({
                                                limit: 1,
                                                where: {UserId: user.id},
                                            }).then(function (PhoneNumbers) {
                                                if(req.params.userId != undefined && req.params.userId != null){
                                                    //Store Searched Commodity in
                                                    models.RecentSearchCommodity.create({
                                                        CommodityId: commodity.id,
                                                        ItemId: item.id,
                                                        UserId: req.params.userId,
                                                    }).then(function (insertedRecentSearches) {

                                                        req.session.specificBiddingItem = {'item': item, 'commodity': commodity, 'itemImages': itemImages, 'emails': Emails,
                                                            'user': user, 'warehouse': warehouse, 'remainingTime': difference, 'phoneNumbers': PhoneNumbers,
                                                            'similarItems': similarItems, 'measureUnits': MeasuerUnits, 'priceUnits': PriceUnits, 'packingTypes': PackingTypes};

                                                        Item.update(
                                                            { hits: (parseInt(hits)+1) },
                                                            { where: { id: id } }
                                                        ).then(function (results) {
                                                            res.redirect('/items/id/'+itemId);
                                                        });
                                                    });
                                                } else {
                                                    req.session.specificBiddingItem = {'item': item, 'commodity': commodity, 'itemImages': itemImages, 'emails': Emails,
                                                        'user': user, 'warehouse': warehouse, 'remainingTime': difference, 'phoneNumbers': PhoneNumbers,
                                                        'similarItems': similarItems, 'measureUnits': MeasuerUnits, 'priceUnits': PriceUnits, 'packingTypes': PackingTypes};

                                                    Item.update(
                                                        { hits: (parseInt(hits)+1) },
                                                        { where: { id: id } }
                                                    ).then(function (results) {

                                                    });
                                                }
                                            })
                                        })
                                    });

                                });
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

/* Retrieve item added by a specific user */
/* Usage: User Account Selling Page */
router.get('/start/:start/userId/:userId', function (req, res) {
    //retrieve data from req object
    var userId = req.params.userId;
    var start = req.params.start;
    var sellingpageItemOption = req.query['sellingpageItemOption'];
    var openDurationOption = req.query['openDurationOption'];
    var pendingDurationOption = req.query['pendingDurationOption'];
    var cancelledDurationOption = req.query['cancelledDurationOption'];
    var nextSellingpageItemOption = '';

    //define where object of sequelize object according to filtering parameters selected in User Account Selling page
    var whereObject = {};

    if(sellingpageItemOption == 'Open') {
        if(openDurationOption == "0"){
            whereObject = {
                UserId: userId,
                status: 'open',
            };
        } else {
            whereObject = {
                UserId: userId,
                status: 'open',
                createdAt: {gte: sequelize.fn('date_sub',moment().format(),sequelize.literal('interval '+openDurationOption+' month'))}
            };
        }
        start = start.split(",")[0];
        nextSellingpageItemOption = 'Open';
    } else if(sellingpageItemOption == 'Pending') {
        if(pendingDurationOption == "0"){
            whereObject = {
                UserId: userId,
                status: 'pending',
                //duration: {gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))},
            };
        } else {
            whereObject = {
                UserId: userId,
                status: 'pending',
                //duration: {gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))},
                createdAt: {gte: sequelize.fn('date_sub',moment().format(),sequelize.literal('interval '+openDurationOption+' month'))}
            };
        }

        start = start.split(",")[1];
        nextSellingpageItemOption = 'Pending';
    } else if(sellingpageItemOption == 'Cancelled') {
        if(cancelledDurationOption == "0"){
            whereObject = {
                UserId: userId,
                $or: [{status: 'cancelled'}, {status: 'mutual-cancellation-all'}, {status:'mutual-cancellation-buyer'}, {status: 'mutual-cancellation-seller'}],
            };
        } else {
            whereObject = {
                UserId: userId,
                $or: [{status: 'cancelled'}, {status: 'mutual-cancellation-all'}, {status:'mutual-cancellation-buyer'}, {status: 'mutual-cancellation-seller'}],
                createdAt: {gte: sequelize.fn('date_sub',moment().format(),sequelize.literal('interval '+openDurationOption+' month'))}
            };
        }

        start = start.split(",")[2];
        nextSellingpageItemOption = 'Cancelled';
    }

    sequelize.sync().then(
        function () {
            var Item = models.Item;
            var ItemImage = models.ItemImage;
            var Bidding = models.Bidding;
            var User = models.User;
            var Commodity = models.Commodity;
            Item.findAndCountAll({
                where: whereObject,
                offset: parseInt(start),
                limit: 10,
                include: [ItemImage, Bidding, Commodity, User],
                order: '`createdAt` DESC'
            }).then(function (Items) {
                //calculate remaining times for bidding items & bidding details of each item
                var currentTime = new Date().getTime() / 1000;
                var remainingTimes = [];
                var allBiddings = [];
                async.forEach(Items.rows, function(item, callback1) {
                    //calculate remaining time
                    var difference = ((item.createdAt.getTime() / 1000) + item.duration) - currentTime;
                    if(difference < 0) {
                        difference = 0;
                    }

                    //calculate bidding close time
                    var closedTimeinSec = ((item.createdAt.getTime() / 1000) + item.duration)*1000;
                    var closedTime = moment(closedTimeinSec).format('YYYY-MM-DD HH:mm:ss');

                    var formatedTimeCreated = moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss');
                    remainingTimes.push([difference, formatedTimeCreated, closedTime]);

                    //retrieve user of bidding.
                    var biddings = []
                    async.forEach(item.Biddings, function(bidding, callback2) {
                        var userId = bidding.UserId;
                        User.findAll({
                            where: {
                                id: userId,
                            },
                        }).then(function (user) {
                            bidding.dataValues['username'] = user[0].username;
                            biddings.push(bidding);
                            callback2(null);
                        });
                    }, callback1);
                    allBiddings.push(biddings);
                }, function (err) {
                    //pushing retrieved data to commodity array
                    req.session.sellingList = [Items.rows, allBiddings];
                    req.session.itemsSellingAccountCount = Items.count;
                    req.session.itemsSellingAccountOffset = parseInt(req.params.start);
                    req.session.searchResultRemainingTimeSelling = remainingTimes;
                    res.redirect('/user/sell/list/start/'+req.params.start+'?sellingpageItemOption='+nextSellingpageItemOption+'&openDurationOption='+req.query['openDurationOption']+'&pendingDurationOption='+req.query['pendingDurationOption']+'&cancelledDurationOption='+req.query['cancelledDurationOption']);
                });

            });
        }
    );
});


/* Update item status */
/* Usage: User Account Selling Page. When action triggered */
router.post('/update/status', function (req, res) {
    //retrieve data from req object
    var itemId = req.body.itemId;
    var status = req.body.action;

    sequelize.sync().then(
        function () {
            var Item = models.Item;
            Item.update(
                { status: status },
                { where: { id: itemId } }
            ).then(function (results) {
                res.redirect('/user/sell/list/start/0');
            });
        }
    );
});


/* Retrieve specific item and its comments from database */
/* Usage: View Bidding Details Seller Page */
router.get('/sell/id/:id', function (req, res) {
    var itemId = req.params.id;

    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var Item = models.Item;
            var User = models.User;
            var ItemImage = models.ItemImage;
            var Commodity = models.Commodity;
            var CommodityMeasureUnit = models.CommodityMeasureUnit;
            var CommodityPriceUnit = models.CommodityPriceUnit;
            var WareHouse = models.WareHouse;
            Item.findAll({
                where: {id: itemId},
                include: [User, ItemImage, Commodity, WareHouse],
            }).then(function (Items) {
                req.session.specificBiddingItemSell = Items[0];

                //retreive measure units
                CommodityMeasureUnit.findAll({
                    where: {CommodityId: Items[0].CommodityId}
                }).then(function (Units) {
                    req.session.specificBiddingItemSellMeasureUnits = Units;

                    //retrieve price units
                    CommodityPriceUnit.findAll({
                        where: {CommodityId: Items[0].CommodityId}
                    }).then(function (PriceUnits) {
                        req.session.specificBiddingItemSellPriceUnits = PriceUnits;
                        res.redirect('/user/sell/edit?itemId='+itemId);
                    });
                });
            });
        }
    );
});

//set preview image to session
router.post('/preview', function (req, res) {
    //retrive data from reqeust header
    req.session.previewImages = req.body.images;

    res.json({message: "Success"});
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

//retreive item list from db.
function retrieveItems(req, res, keyword) {
    var start = req.params.start;
    var class_ = req.query['class'] ? req.query['class'] : req.session.selectedClass;
    var segment = req.query['segment'] ? req.query['segment'] : req.session.selectedSegment;
    var location = req.query['location'] ? req.query['location'] : req.session.selectedLocation;
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

    //check whether location is already ticked or not
    if(req.query['location'] == req.session.selectedLocation) {
        location = null;
        delete req.session.selectedLocation;
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
        if(class_ != "All") {
            whereObject["$Commodity.class$"] = {$like: '%'+class_+'%'};
        }
        req.session.selectedClass = class_;
    }
    if (segment != null && segment != undefined) {
        if(segment != "All") {
            whereObject["$Commodity.segment$"] = {$like: '%'+segment+'%'};
        }
        req.session.selectedSegment = segment;
    }
    if (location != null && location != undefined) {
        if(location != "All") {
            whereObject["$User.mailingCity$"] = {$like: '%'+location+'%'};
        }
        req.session.selectedLocation = location;
    }

    //Filter by price range
    if(startPrice != null && startPrice != undefined) {
        var endPrice = req.query['endPrice'] ? req.query['endPrice'] : req.session.endPrice;
        //whereObject['suggestedPrice'] = {$between: ["LKR "+startPrice, "LKR "+endPrice]};
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
                                var segments = ["All"];
                                var classes = ["All"];
                                var locations = ["All"];
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

                                                Item.aggregate('User.mailingCity', 'DISTINCT',{
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
                                                    include: [User, Commodity],
                                                    group: ['User.mailingCity'],
                                                }).then(function (Locations) {
                                                    console.log(Locations);
                                                    _.forEach(Locations, function(location, index) {
                                                        locations.push(location.DISTINCT);
                                                    });

                                                    req.session.distinctCharacteristics = [segments, classes, locations];
                                                    callback(null, keyword, req);
                                                });

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
}

/* Retrieve specific item from database */
/* Usage: View Contract Details Seller/Buyer Page */
router.get('/contract/id/:id', function (req, res) {
    getItemForContract(req, res, '/user/buy/contract/id/'+req.params.id+'?bidId='+req.session.bidIdContract);
});


/* Retrieve specific item from database */
/* Usage: View Contract Details Seller Page */
router.get('/sellcontract/id/:id/bidId/:bidId', function (req, res) {
    getItemForContract(req, res, '/user/sell/contract/bidId/'+req.params.bidId);
});


/* Retrieve top rated items from database */
/* Usage: Home Page Page */
router.get('/toprated', function (req, res) {
    sequelize.sync().then(
        function () {
            sequelize.query("SELECT DISTINCT i.id,u.full_name,i.title,(SELECT im.url FROM ItemImages im, Items k WHERE im.ItemId = k.id AND i.id=k.id limit 1) as url, AVG(c.rate) as avg_rate FROM Items i, ItemComments c, Users u WHERE i.id = c.ItemId AND u.id = i.UserId GROUP BY c.ItemId ORDER BY avg_rate DESC limit 3;", { type: sequelize.QueryTypes.SELECT})
                .then(function(items) {
                    req.session.toprated = items;
                    res.redirect('/');
                });
        }
    );
});


/* Retrieve near close bids from database */
/* Usage: Home Page Page */
router.get('/neartoclose', function (req, res) {
    sequelize.sync().then(
        function () {
            var Item = models.Item;
            var ItemImage = models.ItemImage;
            var ItemComment = models.ItemComment;
            var User = models.User;
            Item.findAll({
                attributes: ['id', 'title',[sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")), 'left_time']],
                where: {
                    duration: {
                        gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))
                    },
                },
                order: '`left_time` DESC',
                include: [ItemImage, User],
            }).then(function (items) {
                var limitedItems = [];
                _.forEach(items, function(item) {
                    limitedItems.push(item);
                });
                req.session.neartocloseItems = limitedItems;
                res.redirect('/');
            })
        }
    );
});

function getItemForContract(req, res, redirection) {
    var itemId = req.params.id;

    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var Item = models.Item;
            var User = models.User;
            var ItemImage = models.ItemImage;
            var Commodity = models.Commodity;
            var WareHouse = models.WareHouse;
            Item.findAll({
                where: {id: itemId},
                include: [User, ItemImage, Commodity, WareHouse],
            }).then(function (Items) {
                req.session.buyContractItem = Items[0];
                res.redirect(redirection);
            });
        }
    );
}

module.exports = router;