/**
 * Created by kjtdi on 2/8/2017.
 */
var express = require('express');
var _ = require('lodash');
var router = express.Router();
var models = require('./../models');
var sequelize = models.sequelize;
var fs = require('fs');
var moment = require('moment');
var async = require('async');

//store bidding details in database
/* Usage: Bidding Page */
router.post('/add', function (req, res) {
    //retrive data from reqeust header
    var bid = req.body.bid;
    var quantity = req.body.quantity;
    var deliveryBy = req.body.delivery_by;
    var WareHouseId = req.body.warehouse;
    var packingType = req.body.packing_type;
    var paymentTerms = req.body.payment_terms;
    var deliveryDate = req.body.delivery_date;
    var deliveryCost = req.body.delivery_cost;
    var buyerNote = req.body.buyer_note;
    var itemId = req.body.id;
    var UserId = req.body.userId;

    //store item in database
    sequelize.sync().then(
        function () {
            var Bidding = models.Bidding;
            Bidding.create({
                bid: bid,
                quantity: quantity,
                deliveryBy: deliveryBy,
                WareHouseId: WareHouseId,
                packageType: packingType,
                paymentTerms: paymentTerms,
                note: buyerNote,
                status: 0,
                ItemId: itemId,
                UserId: UserId,
            }).then(function (insertedBidding) {
                console.log(insertedBidding);
                var insertedItemId = insertedBidding.dataValues.id;
                res.redirect('/items/id/'+itemId);
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
    var itemId = req.params.itemId;
    var UserId = req.params.userId;

    //store item in database
    sequelize.sync().then(
        function () {
            var Bidding = models.Bidding;

            //find logged users last bid
            Bidding.findAll({
                where: {
                    UserId: UserId,
                    ItemId: itemId,
                },
                limit: 1,
                order: '`createdAt` DESC'
            }).then(function (Bids) {
                var lastUserBid = Bids;

                //find last bid
                Bidding.findAll({
                    where: {
                        ItemId: itemId,
                    },
                    limit: 1,
                    order: '`createdAt` DESC'
                }).then(function (Bids) {
                    var lastBid = Bids;

                    console.log(lastBid);
                    req.session.lastBid = lastBid;
                    req.session.lastUserBid = lastUserBid;
                    res.redirect('/items/id/'+itemId);
                });
            });
        }
    );
});

//View biddings for specific item
/*Usage: View bidding details seller page */
router.get('/start/:start/itemId/:itemId', function (req, res) {
    //retrive data from reqeust header
    var itemId = req.params.itemId;

    //store item in database
    sequelize.sync().then(
        function () {
            var Bidding = models.Bidding;
            var User = models.User;
            var WareHouse = models.WareHouse;

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
                var bidsCreatedAt = [];
                _.forEach(Bids.rows, function(bid, index) {
                    var formatedTimeCreated = moment(bid.updatedAt).format('YYYY-MM-DD HH:mm:ss');
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
    updateStatus(req, res, 'http://localhost:3000/user/sell/bids/start/0?itemId='+req.body.itemId);
});


/* Update bid status */
/* Usage: buyercontract page to mutual cancellation the bid */
router.post('/updatecontract/status', function (req, res) {
    updateStatus(req, res, 'http://localhost:3000/user/buy/contract/id/'+req.body.itemId);
});

/* Update bid status */
/* Usage: sellercontract page to mutual cancellation the bid */
router.post('/updatesellcontract/status', function (req, res) {
    updateStatus(req, res, 'http://localhost:3000/user/sell/contract/bidId/'+req.body.bidId);
});


/* Retrieve bids by a specific user */
/* Usage: User Account Buying Page */
router.get('/start/:start/userId/:userId', function (req, res) {
    //retrieve data from req object
    var userId = req.params.userId;
    var start = req.params.start;
    var buyingpageItemOption = req.query['buyingpageItemOption']? req.query['buyingpageItemOption'] : req.session.buyingpageItemOption;

    //define where object of sequelize object according to filtering parameters selected in User Account Selling page
    var whereObject = {};

    if(buyingpageItemOption == 'All') {
        whereObject = {
            UserId: userId
        };
        req.session.buyingpageItemOption = 'All'
    } else if(buyingpageItemOption == 'Pending') {
        whereObject = {
            UserId: userId,
            '$Item.duration$': {gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))}
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
            var Item = models.Item;
            var ItemImage = models.ItemImage;
            var Bidding = models.Bidding;
            var User = models.User;
            Bidding.findAndCountAll({
                where: whereObject,
                offset: parseInt(start),
                limit: 10,
                include: [Item],
                order: '`createdAt` DESC'
            }).then(function (Biddings) {
                //calculate remaining times for bidding items & bidding details of each item
                var currentTime = new Date().getTime() / 1000;
                var remainingTimes = [];
                var itemImages = [];
                var lastBid = [];

                async.forEach(Biddings.rows, function(bidding, callback1) {
                    //calculate remaining time
                    var item = bidding.Item;
                    var difference = ((item.createdAt.getTime() / 1000) + item.duration) - currentTime;
                    if(difference < 0) {
                        difference = 0;
                    }

                    //calculate bidding close time
                    var closedTimeinSec = ((item.createdAt.getTime() / 1000) + item.duration)*1000;
                    var closedTime = moment(closedTimeinSec).format('YYYY-MM-DD HH:mm:ss');

                    var formatedTimeCreated = moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss');
                    remainingTimes.push([difference, formatedTimeCreated, closedTime]);

                    //retrieve item images.
                    var itemId = bidding.Item.id;
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
                        var itemId = bidding.Item.id;
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
});


/* Update bid value */
/* Usage: useraccountbuying page. */
router.post('/update/bid', function (req, res) {
    //retrieve data from req object
    var id = req.body.id;
    var bid = req.body.newbid;

    sequelize.sync().then(
        function () {
            var Bidding = models.Bidding;
            Bidding.update(
                { bid: bid },
                { where: { id: id } }
            ).then(function (results) {
                res.redirect('http://localhost:3000/user/buy/list/start/0');
            });
        }
    );
});

/* Retrieve specific bid from database */
/* Usage: View Contract Details Seller/Buyer Page */
router.get('/contract/userId/:userId/itemId/:itemId', function (req, res) {
    var userId = req.params.userId;
    var itemId = req.params.itemId;

    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var Bidding = models.Bidding;
            var User = models.User;
            Bidding.findAll({
                where: {ItemId: itemId, UserId: userId},
                include: [User],
            }).then(function (Biddings) {
                req.session.buyContractBid = Biddings[0];
                req.session.contractDate = moment(Biddings[0].updatedAt).format('YYYY-MM-DD HH:mm:ss');
                res.redirect('/user/buy/contract/id/'+itemId);
            });
        }
    );
});

/* Retrieve specific bid from database */
/* Usage: View Contract Details Seller/Buyer Page */
router.get('/sellcontract/bidId/:bidId', function (req, res) {
    var bidId = req.params.bidId;

    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var Bidding = models.Bidding;
            var User = models.User;
            Bidding.findAll({
                where: {id: bidId},
                include: [User],
            }).then(function (Biddings) {
                req.session.sellContractBid = Biddings[0];
                req.session.contractDate = moment(Biddings[0].updatedAt).format('YYYY-MM-DD HH:mm:ss');
                res.redirect('/api/items/sellcontract/id/'+Biddings[0].ItemId+'/bidId/'+bidId);
            });
        }
    );
});

//update the status of bids
function updateStatus(req, res, redirectRoute) {
    var bidId = req.body.bidId;
    var status = req.body.status;

    sequelize.sync().then(
        function () {
            var Bidding = models.Bidding;
            Bidding.update(
                { status: status },
                { where: { id: bidId } }
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
        }
    );
}

module.exports = router;