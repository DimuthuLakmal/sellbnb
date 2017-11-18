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

router.post('/add', function(req, res) {
  // sequelize.sync().then(
  //   function () {
  //     var Offer = models.Offer;
  //     Offer.create({
  //       offerPrice : req.body.offerPrice + ' ' + req.body.priceUnit,
  //       quantity: req.body.quantity + ' ' + req.body.measureUnit,
  //       destinationPort: req.body.destPort,
  //       incoterms : req.body.incoterms,
  //       medium: req.body.medium,
  //       note: req.body.buyerNote,
  //       ItemId: req.body.itemId,
  //       UserId: req.body.userId,
  //       CommodityId: req.body.commodityId,
  //     }).then(function (createdOffer) {
  //       console.log(createdOffer);
  //     })
  //   }
  // ).catch(function (error) {
  // })
  //
  models.User.findAll({
    where : {
      id : req.body.userId
    },
    include: [models.Email, models.PhoneNumber]
  }).then(function (buyer) {
    buyer = buyer[0];
    models.Item.findAll({
      where : {
        id : req.body.itemId,
      } ,
      include: [model.Commodity]
    }).then(function (item) {
      item = item[0];
      console.log('========================================');
      console.log(buyer);
      console.log(item);
    })
  });


  sequelize.sync().then(
    function () {
      var Message = models.Message;
      Message.create({
        subject: subject,
        message: message,
        seen: 0,
        senderUserIdFk: senderUserId,
        receiverUserIdFk: receiverUserId,
      }).then(function (insertedMessage) {
        // Send an email
        models.User.findAll({
          where : {
            '$User.id$' : receiverUserId
          },
          include: [models.Email]
        }).then(function (recievedUser) {
          models.User.findAll({
            where : {
              '$User.id$' : receiverUserId
            },
            include: [models.Email, models.PhoneNumber]
          }).then(function (sendUser) {

            var helper = require('sendgrid').mail;

            var emailSubject = '[SellBnb] ' + sendUser[0].dataValues.full_name || sendUser[0].dataValues.company_name + ' send you a new message';
            emailTxt = 'Buyer <br>' +
              'Name : ' + sendUser[0].dataValues.full_name + '<br>' +
              'Telephones : ' + sendUser[0].PhoneNumbers.join(', ') + '<br>' +
              'Emails : ' + sendUser[0].Emails.join(', ') + '<br><br>' +
              '------- Begin of Message -------' +
              '<strong>Subject </strong> :' + subject + '<br>' + message + '<br>' +
              '------- End Message -------' +
              '<br><br>' +
              'to reply this message click here :<br>' +
              '<a href="reply">replay</a><br><br>' +
              'For Your Information: To help arbitrate disputes and preserve trust and safety, ' +
              'we retain all messages buyers and sellers send through SellBnB for two years.  ' +
              'This includes your response to the message above.';
            from_email = new helper.Email("sellbnb@gmail.com");
            to_email = new helper.Email(recievedUser[0].Emails[0].dataValues.email);
            content = new helper.Content("text/html", emailTxt);
            mail = new helper.Mail(from_email, emailSubject , to_email, content);

            var sg = require('sendgrid')(sgAPI);
            var request = sg.emptyRequest({
              method: 'POST',
              path: '/v3/mail/send',
              body: mail.toJSON()
            });

            sg.API(request, function(error, response) {
              console.log('============ Email send ===============');
              console.log(response.statusCode);
              console.log(response.body);
              console.log(response.headers);
            });
          });
        });
        if(returnTo !== undefined && returnTo != null) {
          res.redirect(returnTo);
        } else {
          res.redirect('/user/public/userId/'+senderUserId);
        }
      });
    }
  ).catch(function (error) {
    console.log(error);
  });
});


function sendEmail(params, next) {
  var helper = require('sendgrid').mail;

  from_email = new helper.Email(params.from);
  to_email = new helper.Email(params.to);
  subject = pramas.subject;
  content = new helper.Content("text/" + params.contentType, params.content);
  mail = new helper.Mail(from_email, subject, to_email, content);

  var sg = require('sendgrid')(sgAPI);
  var request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON()
  });

  sg.API(request, function(error, response) {
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
    next();
  });
}


function getPlaceOfferEmail(data) {
  return 'Made an offer' +
    'Item : ' +
    '';
}



module.exports = router;