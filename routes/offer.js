/**
 * Created by malaka on 11/19/17.
 */

var express = require('express');
var _ = require('lodash');
var router = express.Router();
var models = require('./../models');
var sequelize = models.sequelize;
var fs = require('fs');
var moment = require('moment');
var async = require('async');
const sgAPI = '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';

var tempObject = {};

router.post('/add', function (req, res) {
  sequelize.sync().then(
    function () {
      models.Offer.create({
        offerPrice: req.body.offerPrice + ' ' + req.body.priceUnit,
        quantity: req.body.quantity + ' ' + req.body.measureUnit,
        destinationPort: req.body.destPort,
        incoterms: req.body.incoterms,
        medium: req.body.medium,
        note: req.body.buyerNote,
        ItemId: req.body.itemId,
        UserId: req.body.userId,
        CommodityId: req.body.commodityId,
      }).then(function (createdOffer) {
        tempObject['offer'] = createdOffer;
        models.Item.findAll({
          where: {
            '$Item.id$': req.body.itemId
          },
          include: [models.User, models.Commodity]
        }).then(function (currentItems) {
          tempObject['item'] = currentItems[0].dataValues;
          models.User.findAll({
            where: {
              '$User.id$': req.body.itemOwner
            },
            include: [models.Email]
          }).then(function (itemOwners) {
            tempObject['itemOwner'] = itemOwners[0].dataValues;
            models.User.findAll({
              where: {
                '$User.id$': req.body.userId
              },
              include: [models.Email, models.PhoneNumber]
            }).then(function (buyers) {
              var buyer = buyers[0];
              var emailList = [];
              var numList = [];
              buyer.Emails.forEach(function (e) {
                emailList.push(e.dataValues.email);
              });
              buyer.PhoneNumbers.forEach(function (e) {
                numList.push(e.dataValues.number);
              });
              require('./email-controller').sendEmail({
                template: 'offer-message',
                to: tempObject.itemOwner.Emails[0].dataValues.email,
                subject: 'New Offer on ' + tempObject.item.title,
              }, {
                item : {
                  title: tempObject.item.title,
                  commodity: tempObject.item.Commodity.dataValues.name,
                  producer: tempObject.item.User.dataValues.full_name,
                  minQ: tempObject.item.quantityMin,
                  maxQ:tempObject.item.quantityMax,
                  packingType: tempObject.item.packageType,
                  loadTime: tempObject.item.loadTime,
                  origin: tempObject.item.origin,
                  note: tempObject.item.note,
                },
                buy: {
                  name: buyer.dataValues.full_name,
                  telephones: numList.join(', '),
                  emails: emailList.join(', ')
                },
                off: {
                  price: tempObject.offer.offerPrice,
                  qty: tempObject.offer.quantity,
                  destinationPort: tempObject.offer.destinationPort,
                  incoterms: tempObject.offer.incoterms,
                  medium: tempObject.offer.medium,
                  note: tempObject.offer.note,
                },
                replyUrl: ''
              });
              // var Message = models.Message;
              // Message.create({
              //   subject: emailSubject,
              //   message: emailTxt,
              //   seen: 0,
              //   senderUserIdFk: senderUserId,
              //   receiverUserIdFk: receiverUserId,
              // }).then(function (insertedMessage) {
              //   // Send an emails
              //   if(returnTo !== undefined && returnTo != null) {
              //     res.redirect(returnTo);
              //   } else {
              //     res.redirect('/user/public/userId/'+senderUserId);
              //   }
              // });
            }).bind(this);
          }).bind(this);
        })
      });
    });
});


module.exports = router;