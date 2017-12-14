/**
 * Created by kjtdi on 4/24/2017.
 */
var express = require('express');
var _ = require('lodash');
var router = express.Router();
var models = require('./../models');
var sequelize = models.sequelize;

/* Add message to database. */
router.post('/add', function (req, res) {
  //retrieve data from req object
  var message = req.body.message;
  var senderUserId = req.body.senderUserIdFk;
  var receiverUserId = req.body.receiverUserIdFk;
  var subject = req.body.subject;
  var returnTo = req.body.returnTo;
  var att = JSON.parse(req.body.imageB64);

  //store news in database
  sequelize.sync().then(
    function () {
      var Message = models.Message;
      Message.create({
        subject: subject,
        message: message,
        att_count: att.length,
        senderUserIdFk: senderUserId,
        receiverUserIdFk: receiverUserId
      }).then(function (insertedMessage) {
        // Send an emails
        models.User.findAll({
          where: {
            '$User.id$': receiverUserId
          },
          include: [models.Email]
        }).then(function (recievedUser) {
          models.User.findAll({
            where: {
              '$User.id$': senderUserId
            },
            include: [models.Email, models.PhoneNumber]
          }).then(function (sendUser) {
            var emailList = [];
            var numList = [];
            sendUser[0].Emails.forEach(function (e) {
              emailList.push(e.dataValues.email);
            });
            sendUser[0].PhoneNumbers.forEach(function (e) {
              numList.push(e.dataValues.number);
            });
            var emailData = {
              template: 'user-message',
              to: recievedUser[0].Emails[0].dataValues.email,
              subject: '[SellBnb] ' + (sendUser[0].dataValues.full_name || sendUser[0].dataValues.company_name || sendUser[0].dataValues.username) + ' send you a new message'
            };
            if (att.length > 0) {
              emailData.attachments = att;
            }
            require('./email-controller').sendEmail(emailData, {
              senderName: sendUser[0].dataValues.full_name || sendUser[0].dataValues.company_name || sendUser[0].dataValues.username,
              fullName: sendUser[0].dataValues.full_name,
              telephones: numList.join(', '),
              emails: emailList.join(', '),
              subject: subject,
              message: message,
              replyUrl: 'asdfasd' + insertedMessage.id
            })
          });
        });
        if (returnTo !== undefined && returnTo != null) {
          res.redirect(returnTo);
        } else {
          res.redirect('/user/public/userId/' + senderUserId);
        }
      });
    }
  ).catch(function (error) {
    console.log(error);
  });
});

/* Add message reply to database. */
router.post('/addreply', function (req, res) {
  //retrieve data from req object
  var reply = req.body.reply;
  var userId = req.body.userId;
  var messageId = req.body.messageId;
  var att = JSON.parse(req.body.imageB64);

  //store news in database
  sequelize.sync().then(
    function () {
      var MessageReply = models.MessageReply;
      var Message = models.Message;
      MessageReply.create({
        message: reply,
        MessageId: messageId,
        UserId: userId,
        att_count: att.length
      }).then(function (insertedMessageReply) {
        res.redirect('/user/messages/id/' + messageId);
      });
    }
  ).catch(function (error) {
    console.log(error);
  });
});

//retreive messages from database for user
/* Usage: Header */
router.get('/userId/:userId', function (req, res) {
  var UserId = req.params.userId;

  //store item in database
  sequelize.sync().then(
    function () {
      var Message = models.Message;

      //find user's notification
      Message.findAll({
        where: {
          receiverUserIdFk: UserId
        }
      }).then(function (Messages) {
        req.session.messages = Messages;
        res.redirect(req.session.returnToCommodityName);
      });
    }
  );
});

//retreive messages from database for inbox
/* Usage: viewmessagesinbox page */
router.get('/inbox/userId/:userId', function (req, res) {
  var UserId = req.params.userId;

  //store item in database
  sequelize.sync().then(
    function () {
      var Message = models.Message;
      var User = models.User;

      //find user's notification
      Message.findAll({
        where: {
          receiverUserIdFk: UserId
        },
        include: [{
          model: User,
          as: 'senderUserId'
        }]
      }).then(function (Messages) {
        req.session.inboxMessages = Messages;
        res.redirect('/user/inbox');
      });
    }
  );
});

//retreive messages from database for sentbox
/* Usage: viewmessagessent page */
router.get('/sent/userId/:userId', function (req, res) {
  var UserId = req.params.userId;

  //store item in database
  sequelize.sync().then(
    function () {
      var Message = models.Message;
      var User = models.User;

      //find user's notification
      Message.findAll({
        where: {
          senderUserIdFk: UserId
        },
        include: [{
          model: User,
          as: 'receiverUserId'
        }]
      }).then(function (Messages) {
        req.session.sentMessages = Messages;
        res.redirect('/user/sent');
      });
    }
  );
});

//update message unseen to seen and visit message UI
/* Usage: Header */
router.get('/update/id/:id', function (req, res) {
  var id = req.params.id;

  //update database
  sequelize.sync().then(
    function () {
      var Message = models.Message;
      var MessageReply = models.MessageReply;
      var User = models.User;
      Message.findAll({
        where: {
          id: id
        },
        include: [{
          model: User,
          as: 'senderUserId'
        }]
      }).then(function (msgs) {
        if (msgs[0].dataValues.receiverUserIdFk === req.user.id) {
          MessageReply.findAll({
            where: {MessageId: msgs[0].dataValues.id},
            include: [User]
          }).then(function (MessageReplies) {
            req.session.messageReplies = MessageReplies;
            req.session.messageDetails = msgs[0];
            res.redirect('/user/messages/id/' + id);
          });
        } else {
          req.session.returnTo = req.session.inCorrectLoginPath;
          res.redirect('/user/login?action=login');
        }
      });
    }
  );
});

router.post('/support_message', function (req, res) {
  var Recaptcha = require('express-recaptcha');

  var recaptcha = new Recaptcha('6Leb9zwUAAAAAEk2Ft01XQmNjuRiiAscYB3ZcRNK', '6Leb9zwUAAAAAM2gLIuDl3_9mKGco4sXzDwCaJ7g');

  if (!((req.body.subject !== '') &&
    (req.body.email !== '') &&
    (req.body.message !== '') &&
    (req.body['g-captcha-response'] !== ''))) {
    return res.jsonp({
      success: false,
      msg: 'Invalid Form'
    })
  } else {
    recaptcha.verify(req, function (error, data) {
      if (error) {
        return res.jsonp({
          success: false,
          msg: 'Invalid Captcha'
        })
      } else {
        require('./email-controller').sendEmail({
          template: 'support-message',
          to: 'antcommodity@gmail.com',
          subject: '[SUPPORT] - User Support request'
        }, {
          subject: req.body.subject,
          email: req.body.email,
          message: req.body.message
        });
        return res.jsonp({
          success: true,
          msg: 'Sent Message to Support !'
        })
      }
    });
  }
});

module.exports = router;