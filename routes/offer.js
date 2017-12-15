/**
 * Created by malaka on 11/19/17.
 */

let express = require('express');
let _ = require('lodash');
let router = express.Router();
let models = require('./../models');
let sequelize = models.sequelize;
let fs = require('fs');
let moment = require('moment');
let async = require('async');

let tempObject = {};

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
              let buyer = buyers[0];
              const emailList = [];
              let numList = [];
              buyer.Emails.forEach(function (e) {
                emailList.push(e.dataValues.email);
              });
              buyer.PhoneNumbers.forEach(function (e) {
                numList.push(e.dataValues.number);
              });
              let Message = models.Message;

              let locals = {
                origin: req.headers.origin,
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
                  itemLink: tempObject.item.item_url_code
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
                  note: tempObject.offer.note
                },
                replyUrl: req.headers.origin + '/user/messages/id/'
              };
              Message.create({
                subject: 'New Offer on ' + tempObject.item.title,
                message: `<h2>Item ${ locals.item.title } has offer</h2> 
                <h3>Item Details</h3> 
                <ul> 
                <li><strong>Commodity: </strong>${locals.item.commodity}</li> 
                <li><strong>Item Title: </strong>${locals.item.title}
                [<a href="${locals.origin + '/items/name/' + locals.item.itemLink}">${ locals.origin + '/items/name/' + locals.item.itemLink}</a>]</li>
              <li><strong>Producer Name: </strong>${ locals.item.producer }</li>
                <li><strong>Min Qty: </strong>${ locals.item.minQ }</li>
                <li><strong>Max Qty: </strong>${ locals.item.maxQ }</li>
                <li><strong>Packing Type: </strong>${ locals.item.packingType }</li>
                <li><strong>Load Time: </strong>${ locals.item.loadTime }</li>
                <li><strong>Origin: </strong>${ locals.item.origin }</li>
                <li><strong>Producer Note: </strong>${ locals.item.note }</li>
                </ul>
                <h3>Offer Details</h3>
              <ul>
              <li><strong>Offer: </strong>${ locals.off.price }</li>
                <li><strong>Quantity: </strong>${ locals.off.qty }</li>
                <li><strong>Destination Port: </strong>${ locals.off.destinationPort }</li>
                <li><strong>Incoterms: </strong>${ locals.off.incoterms }</li>
                <li><strong>Medium: </strong>${ locals.off.medium }</li>
                <li><strong>Note: </strong>${ locals.off.note }</li>
                </ul>`,
                seen: 0,
                senderUserIdFk: buyer.id,
                receiverUserIdFk: tempObject.itemOwner.id
              }).then(function (insertedMessage) {
                // Send an emails
                locals.replyUrl = locals.replyUrl + insertedMessage.id + '?expUsr=' + tempObject['itemOwner'].username;
                require('./email-controller').sendEmail({
                  template: 'offer-message',
                  to: tempObject.itemOwner.Emails[0].dataValues.email,
                  subject: 'New Offer on ' + tempObject.item.title,
                }, locals);
                res.sendStatus(200);
              });
            }).bind(this);
          }).bind(this);
        })
      });
    });
});


module.exports = router;