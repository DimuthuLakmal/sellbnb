/**
 * Created by kjtdi on 2/8/2017.
 */
let express = require('express');
let _ = require('lodash');
let router = express.Router();
let models = require('./../models');
let sequelize = models.sequelize;
let fs = require('fs');
let moment = require('moment');
let async = require('async');
const sgAPI = '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';

//store bidding details in database
/* Usage: Bidding Page */
router.post('/add', function (req, res) {
    //retrive data from reqeust header
    let priceUnit = req.body.priceUnit;
    let priceUnitDelivery = req.body.priceUnitDelivery;
    let bid = priceUnit + " " + req.body.bid;
    //let measureUnit = req.body.measureUnit;
    //let quantity = req.body.quantity + " " + measureUnit;
    let deliveryBy = req.body.delivery_by;
    let WareHouseId = req.body.warehouse;
    //let packingType = req.body.packing_type;
    //let paymentTerms = req.body.payment_terms;
    //let deliveryDate = req.body.delivery_date;
    let deliveryCostTemp = req.body.delivery_cost;
    let deliveryCost = "";
    if(deliveryCostTemp != null && deliveryCostTemp != undefined && deliveryCostTemp != "") {
        deliveryCost = priceUnitDelivery + " " + deliveryCostTemp;
    } else {
        WareHouseId = null;
    }
    //let buyerNote = req.body.buyer_note;
    let itemId = req.body.id;
    let UserId = req.body.userId;

    //store item in database
    sequelize.sync().then(
        function () {
            let Bidding = models.Bidding;
            Bidding.create({
                bid: bid,
                //quantity: quantity,
                deliveryBy: deliveryBy,
                deliveryCost: deliveryCost,
                //deliveryDate: deliveryDate,
                WareHouseId: WareHouseId,
                //packageType: packingType,
                //paymentTerms: paymentTerms,
                //note: buyerNote,
                status: 'pending',
                ItemId: itemId,
                UserId: UserId,
            }).then(function (insertedBidding) {
                let insertedItemId = insertedBidding.dataValues.id;
                req.session.bidAddMessage = 'Bid added successfully!';

                let User = models.User;
                let Email = models.Email;
                let PhoneNumber = models.PhoneNumber;
                User.findAll({
                    where: {id: UserId},
                    include: [Email, PhoneNumber],
                }).then(function (Users) {

                    let EmailAddress = Users[0].dataValues.Emails[0].dataValues.email;
                    //
                    // let helper = require('sendgrid').mail;
                    //
                    // from_email = new helper.Email("sellbnb@gmail.com");
                    // to_email = new helper.Email(EmailAddress);
                    // subject = "Seller BnB Notification";
                    // content = new helper.Content("text/plain", "You have successfully added your bid!");
                    // mail = new helper.Mail(from_email, subject, to_email, content);
                    //
                    // let sg = require('sendgrid')(sgAPI);
                    // let request = sg.emptyRequest({
                    //     method: 'POST',
                    //     path: '/v3/mail/send',
                    //     body: mail.toJSON()
                    // });
                    //
                    // sg.API(request, function(error, response) {
                    //     console.log(response.statusCode);
                    //     console.log(response.body);
                    //     console.log(response.headers);
                    //     res.redirect('/items/id/'+itemId);
                    // });

                });
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});

//view bidding details in bidding page. ex: last bid, user's last bid etc.
/* Usage: Bidding Page */
router.get('/items/userId/:userId/itemId/:itemId', function (req, res) {
    //retrive data from reqeust header
    let itemId = req.params.itemId;
    let UserId = req.params.userId;

    //store item in database
    sequelize.sync().then(
        function () {
            let Bidding = models.Bidding;

            //find logged users last bid
            Bidding.findAll({
                where: {
                    UserId: UserId,
                    ItemId: itemId,
                },
                limit: 1,
                order: '`createdAt` DESC'
            }).then(function (Bids) {
                let lastUserBid = Bids;

                //find last bid
                Bidding.findAll({
                    where: {
                        ItemId: itemId,
                    },
                    limit: 1,
                    order: '`createdAt` DESC'
                }).then(function (Bids) {
                    let lastBid = Bids;

                    req.session.lastBid = lastBid;
                    req.session.lastUserBid = lastUserBid;
                    res.redirect('/items/name/'+itemId);
                });
            });
        }
    );
});

//View biddings for specific item
/*Usage: View bidding details seller page */
router.get('/start/:start/itemId/:itemId', function (req, res) {
    //retrive data from reqeust header
    let itemId = req.params.itemId;

    //store item in database
    sequelize.sync().then(
        function () {
            let Bidding = models.Bidding;
            let User = models.User;
            let WareHouse = models.WareHouse;

            //find logged users last bid
            Bidding.findAndCountAll({
                where: {
                    ItemId: itemId,
                },
                limit: 10,
                offset: parseInt(req.params.start),
                order: '`createdAt` DESC',
                include: [User, WareHouse],
            }).then(function (Bids) {
                let bidsCreatedAt = [];
                _.forEach(Bids.rows, function(bid, index) {
                    let formatedTimeCreated = moment(bid.updatedAt).format('YYYY-MM-DD HH:mm:ss');
                    bidsCreatedAt.push(formatedTimeCreated);
                });

                req.session.biddingList = [Bids.rows, bidsCreatedAt];
                req.session.biddingSellingAccountOffset = parseInt(req.params.start);
                req.session.biddingSellingAccountCount = Bids.count;
                res.redirect('/api/items/sell/id/'+itemId);
            });
        }
    );
});


/* Update bid status */
/* Usage: View Bidding Details Page in Seller. */
router.post('/update/status', function (req, res) {
    updateStatus(req, res, '/user/sell/bids/start/0?itemId='+req.body.itemId);
});


/* Update bid status */
/* Usage: buyercontract page to mutual cancellation the bid */
router.post('/updatecontract/status', function (req, res) {
    updateStatus(req, res, '/user/buy/contract/id/'+req.body.itemId);
});

/* Update bid status */
/* Usage: sellercontract page to mutual cancellation the bid */
router.post('/updatesellcontract/status', function (req, res) {
    updateStatus(req, res, '/user/sell/contract/bidId/'+req.body.bidId);
});


/* Retrieve bids by a specific user */
/* Usage: User Account Buying Page */
function test(req, res) {
    //retrieve data from req object
    let userId = req.params.userId;
    let start = req.params.start;
    let buyingpageItemOption = req.query['buyingpageItemOption']? req.query['buyingpageItemOption'] : req.session.buyingpageItemOption;

    //define where object of sequelize object according to filtering parameters selected in User Account Selling page
    let whereObject = {};

    if(buyingpageItemOption == 'Open') {
        whereObject = {
            UserId: userId,
        };
        req.session.buyingpageItemOption = 'Open'
    } else if(buyingpageItemOption == 'Pending') {
        whereObject = {
            UserId: userId,
            // '$Item.duration$': {gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))}
        };
        req.session.buyingpageItemOption = 'Pending';
    } else if(buyingpageItemOption == 'Canceled') {
        whereObject["duration"] =
        {lt: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))}
        req.session.buyingpageItemOption = 'Canceled';
    } else {
        whereObject = {
            UserId: userId
        };
        req.session.buyingpageItemOption = 'All';
    }

    sequelize.sync().then(
        function () {
            let Item = models.Item;
            let ItemImage = models.ItemImage;
            let Bidding = models.Bidding;
            let User = models.User;
            Bidding.findAndCountAll({
                where: whereObject,
                offset: parseInt(start),
                limit: 10,
                include: [Item],
                order: '`createdAt` DESC'
            }).then(function (Biddings) {
                //calculate remaining times for bidding items & bidding details of each item
                let currentTime = new Date().getTime() / 1000;
                let remainingTimes = [];
                let itemImages = [];
                let lastBid = [];

                async.forEach(Biddings.rows, function(bidding, callback1) {
                    //calculate remaining time
                    let item = bidding.Item;
                    let difference = ((item.createdAt.getTime() / 1000) + item.duration) - currentTime;
                    if(difference < 0) {
                        difference = 0;
                    }

                    //calculate bidding close time
                    let closedTimeinSec = ((item.createdAt.getTime() / 1000) + item.duration)*1000;
                    let closedTime = moment(closedTimeinSec).format('YYYY-MM-DD HH:mm:ss');

                    let formatedTimeCreated = moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss');
                    remainingTimes.push([difference, formatedTimeCreated, closedTime]);

                    //retrieve item images.
                    let itemId = bidding.Item.id;
                    ItemImage.findAll({
                        where: {
                            ItemId: itemId,
                        },
                    }).then(function (images) {
                        itemImages.push(images[0]);
                        callback1(null);
                    });
                }, function (err) {

                    async.forEach(Biddings.rows, function(bidding, callback2) {
                        //calculate remaining time
                        let itemId = bidding.Item.id;
                        Bidding.findAll({
                            where: {
                                ItemId: itemId,
                            },
                            order: '`bid` DESC',
                            limit: 1,
                        }).then(function (biddings) {
                            lastBid.push(biddings[0]);
                            callback2(null);
                        });
                    }, function (err) {
                        //pushing retrieved data to commodity array
                        req.session.buyingList = [Biddings,itemImages,lastBid];
                        req.session.itemsBuyingAccountCount = Biddings.count;
                        req.session.itemsBuyingAccountOffset = parseInt(req.params.start);
                        req.session.searchResultRemainingTimeBuying = remainingTimes;
                        res.redirect('/user/buy/list/start/'+start);
                    });
                });


            });
        }
    );
};

router.get('/start/:start/userId/:userId', function (req, res) {
    //retrieve data from req object
    let userId = req.params.userId;
    let start = req.params.start;
    let buyingpageItemOption = req.query['buyingpageItemOption'];
    let openDurationOption = req.query['openDurationOption'];
    let pendingDurationOption = req.query['pendingDurationOption'];
    let cancelledDurationOption = req.query['cancelledDurationOption'];
    let nextBuyingpageItemOption = '';

    //define where object of sequelize object according to filtering parameters selected in User Account Selling page
    let whereObject = {};

    if(buyingpageItemOption == 'Open') {
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
        nextBuyingpageItemOption = 'Open';
    } else if(buyingpageItemOption == 'Pending') {
        if(pendingDurationOption == "0"){
            whereObject = {
                UserId: userId,
                status: 'pending',
            };
        } else {
            whereObject = {
                UserId: userId,
                status: 'pending',
                //'$Item.duration$': {gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))},
                createdAt: {gte: sequelize.fn('date_sub',moment().format(),sequelize.literal('interval '+pendingDurationOption+' month'))}
            };
        }

        start = start.split(",")[1];
        nextBuyingpageItemOption = 'Pending';
    } else if(buyingpageItemOption == 'Cancelled') {
        // whereObject["duration"] =
        // {lt: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))}
        if(cancelledDurationOption == "0"){
            whereObject = {
                UserId: userId,
                $or: [{status: 'cancelled'}, {status: 'mutual-cancellation-all'}, {status:'mutual-cancellation-buyer'}, {status: 'mutual-cancellation-seller'}],
                //'$Item.duration$': {gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))}
            };
        } else {
            whereObject = {
                UserId: userId,
                $or: [{status: 'cancelled'}, {status: 'mutual-cancellation-all'}, {status:'mutual-cancellation-buyer'}, {status: 'mutual-cancellation-seller'}],
                //'$Item.duration$': {gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))},
                createdAt: {gte: sequelize.fn('date_sub',moment().format(),sequelize.literal('interval '+cancelledDurationOption+' month'))}
            };
        }
        start = start.split(",")[2];
        nextBuyingpageItemOption = 'Cancelled';
    }

    sequelize.sync().then(
        function () {
            let Item = models.Item;
            let Commodity = models.Commodity;
            let ItemImage = models.ItemImage;
            let Bidding = models.Bidding;
            let User = models.User;
            Bidding.findAndCountAll({
                where: whereObject,
                offset: parseInt(start),
                limit: 10,
                include: [Item],
                order: '`createdAt` DESC'
            }).then(function (Biddings) {
                //calculate remaining times for bidding items & bidding details of each item
                let currentTime = new Date().getTime() / 1000;
                let remainingTimes = [];
                let itemImages = [];
                let lastBid = [];
                let itemDetails = [];

                async.forEach(Biddings.rows, function(bidding, callback1) {
                    //calculate remaining time
                    let item = bidding.Item;
                    // let difference = ((item.createdAt.getTime() / 1000) + item.duration) - currentTime;
                    // if(difference < 0) {
                    let difference = 0;
                    // }

                    //calculate bidding close time
                    // let closedTimeinSec = ((item.createdAt.getTime() / 1000) + item.duration)*1000;
                    // let closedTime = moment(closedTimeinSec).format('YYYY-MM-DD HH:mm:ss');

                    // let formatedTimeCreated = moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss');
                    remainingTimes.push([difference, formatedTimeCreated, closedTime]);

                    //retrieve item images.
                    let itemId = bidding.Item.id;
                    ItemImage.findAll({
                        where: {
                            ItemId: itemId,
                        },
                    }).then(function (images) {
                        itemImages.push(images[0]);
                        callback1(null);
                    });
                }, function (err) {

                    async.forEach(Biddings.rows, function(bidding, callback2) {
                        //calculate remaining time
                        let itemId = bidding.Item.id;
                        Bidding.findAll({
                            where: {
                                ItemId: itemId,
                            },
                            order: '`bid` DESC',
                            limit: 1,
                        }).then(function (biddings) {
                            lastBid.push(biddings[0]);
                            callback2(null);
                        });
                    }, function (err) {

                        async.forEach(Biddings.rows, function(bidding, callback3) {
                            //calculate remaining time
                            let itemId = bidding.Item.id;
                            Item.findAll({
                                where: {
                                    id: itemId,
                                },
                                include: [Commodity, User]
                            }).then(function (items) {
                                itemDetails.push({item: items[0].Commodity, user:items[0].User});
                                callback3(null);
                            });
                        }, function (err) {
                            //pushing retrieved data to commodity array
                            req.session.buyingList = [Biddings,itemImages,lastBid, itemDetails];
                            req.session.itemsBuyingAccountCount = Biddings.count;
                            req.session.itemsBuyingAccountOffset = parseInt(req.params.start);
                            req.session.searchResultRemainingTimeBuying = remainingTimes;
                            res.redirect('/user/buy/list/start/'+req.params.start+'?buyingpageItemOption='+nextBuyingpageItemOption+'&openDurationOption='+req.query['openDurationOption']+'&pendingDurationOption='+req.query['pendingDurationOption']+'&cancelledDurationOption='+req.query['cancelledDurationOption']);
                        });
                    });
                });


            });
        }
    );
});

/* Retrieve acceped bids counts of a user */
/* Usage: userprofile.ejs Page */
router.get('/userId/:userId/itemUserId/:itemUserId', function (req, res) {
    //retrieve data from req object
    let userId = req.params.userId;
    let itemUserId = req.params.itemUserId;

    sequelize.sync().then(
        function () {
            let Item = models.Item;
            let Bidding = models.Bidding;
            Bidding.findAndCountAll({
                where: {
                    UserId: userId,
                    '$Item.UserId$': itemUserId,
                    status: 'open',
                },
                include: [Item],
            }).then(function (Biddings) {
                req.session.biddingCountUserProfile = Biddings.count;
                res.redirect('/user/public/userId/'+itemUserId);
            });
        }
    );
});


/* Update bid value */
/* Usage: useraccountbuying page. */
router.post('/update/bid', function (req, res) {
    //retrieve data from req object
    let id = req.body.id;
    let bid = req.body.newbid;

    sequelize.sync().then(
        function () {
            let Bidding = models.Bidding;
            Bidding.update(
                { bid: bid },
                { where: { id: id } }
            ).then(function (results) {
                console.log(results);
                req.session.updateBidMessage = 'Successfully updated the bid';
                res.redirect('/user/buy/list/start/0,0,0?buyingpageItemOption=Open&openDurationOption=1&pendingDurationOption=1&cancelledDurationOption=1');
            });
        }
    );
});

/* Retrieve specific bid from database */
/* Usage: View Contract Details Seller/Buyer Page */
router.get('/contract/userId/:userId/bidId/:bidId/itemId/:itemId', function (req, res) {
    let userId = req.params.userId;
    let bidId = req.params.bidId;
    let itemId = req.params.itemId;

    //retrieve data from req object
    sequelize.sync().then(
        function () {
            let Bidding = models.Bidding;
            let Item = models.Item;
            let WareHouse = models.WareHouse;
            let User = models.User;
            Bidding.findAll({
                where: {id: bidId, UserId: userId},
                include: [User],
            }).then(function (Biddings) {
                req.session.buyContractBid = Biddings[0];
                req.session.contractDate = moment(Biddings[0].updatedAt).format('YYYY-MM-DD HH:mm:ss');
                Item.findAll({
                    where: {id: itemId},
                    include: [WareHouse],
                }).then(function (Items) {
                    req.session.buyContractWareHouse = Items[0].dataValues.WareHouse;
                    res.redirect('/user/buy/contract/id/'+itemId+'?bidId='+bidId);
                })

            });
        }
    );
});

/* Retrieve specific bid from database */
/* Usage: View Contract Details Seller/Buyer Page */
router.get('/sellcontract/bidId/:bidId', function (req, res) {
    let bidId = req.params.bidId;

    //retrieve data from req object
    sequelize.sync().then(
        function () {
            let Bidding = models.Bidding;
            let User = models.User;
            let WareHouse = models.WareHouse;
            Bidding.findAll({
                where: {id: bidId},
                include: [User],
            }).then(function (Biddings) {
                let bidding = Biddings[0].dataValues;
                WareHouse.findAll({
                    where: {
                        id: bidding.WareHouseId,
                    }
                }).then(function (WareHouses) {
                    req.session.sellContractWareHouse = WareHouses[0];
                    req.session.sellContractBid = Biddings[0];
                    req.session.contractDate = moment(Biddings[0].updatedAt).format('YYYY-MM-DD HH:mm:ss');
                    res.redirect('/api/items/sellcontract/id/'+Biddings[0].ItemId+'/bidId/'+bidId);
                });
            });
        }
    );
});

//update the status of bids
function updateStatus(req, res, redirectRoute) {
    let bidId = req.body.bidId;
    let status = req.body.status;
    let itemId = req.body.itemId;
    
    sequelize.sync().then(
        function () {
            let Bidding = models.Bidding;
            let Item = models.Item;
            Bidding.update(
                { status: status },
                { where: { id: bidId } }
            ).then(function (results) {
                if(status == 'open') {
                    Bidding.update(
                        { status: 'cancelled' },
                        { where: {
                                ItemId: itemId,
                                id: {$ne: bidId},
                                status: 'pending',
                            }
                        }
                    ).then(function (results_2) {
                        Item.update(
                            { status: 'open' },
                            { where: { id: itemId } }
                        ).then(function () {
                            res.redirect('/api/notification/add/accept/itemId/'+req.body.itemId+'/bidId/'+req.body.bidId+'/userId/'+req.body.userId+'/itemName/'+req.body.itemName);
                        });

                    });
                } else {

                    Bidding.findAll({
                        where:{
                            status:'open',
                            ItemId: itemId,
                        }
                    }).then(function (Biddings) {
                        if(Biddings.length == 0) {
                            Item.update(
                                {status: status},
                                {where: {id: itemId}}
                            ).then(function (results) {
                                if(req.body.requestFrom == 'Seller') {
                                    res.redirect('/api/notification/add/mutual/type/mutual-cancellation-seller/bidId/'+req.body.bidId+'/itemName/'+
                                        req.body.itemName+'/itemId/'+req.body.itemId+'/userId/'+req.body.userId+'/requestFrom/seller');
                                } else if(req.body.requestFrom == 'Buyer') {
                                    res.redirect('/api/notification/add/mutual/type/mutual-cancellation-buyer/bidId/'+req.body.bidId+'/itemName/'+
                                        req.body.itemName+'/itemId/'+req.body.itemId+'/userId/'+req.body.userId+'/requestFrom/buyer');
                                } else {
                                    res.redirect(redirectRoute);
                                }
                            });
                        } else{
                            if(req.body.requestFrom == 'Seller') {
                                res.redirect('/api/notification/add/mutual/type/mutual-cancellation-seller/bidId/'+req.body.bidId+'/itemName/'+
                                    req.body.itemName+'/itemId/'+req.body.itemId+'/userId/'+req.body.userId+'/requestFrom/seller');
                            } else if(req.body.requestFrom == 'Buyer') {
                                res.redirect('/api/notification/add/mutual/type/mutual-cancellation-buyer/bidId/'+req.body.bidId+'/itemName/'+
                                    req.body.itemName+'/itemId/'+req.body.itemId+'/userId/'+req.body.userId+'/requestFrom/buyer');
                            } else {
                                res.redirect(redirectRoute);
                            }
                        }
                    });
                }
            });
        }
    );
}

module.exports = router;