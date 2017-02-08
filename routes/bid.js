/**
 * Created by kjtdi on 2/8/2017.
 */
var express = require('express');
var _ = require('lodash');
var router = express.Router();
var models = require('./../models');
var sequelize = models.sequelize;
var fs = require('fs');

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

module.exports = router;