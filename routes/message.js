/**
 * Created by kjtdi on 4/24/2017.
 */
let express = require('express');
let _ = require('lodash');
let router = express.Router();
let models = require('./../models');
let sequelize = models.sequelize;

/* Add message to database. */
router.post('/add', function (req, res) {
  //retrieve data from req object
  let message = req.body.message;
  let senderUserId = req.body.senderUserIdFk;
  let receiverUserId = req.body.receiverUserIdFk;
  let subject = req.body.subject;
  let returnTo = req.body.returnTo;
  let att = JSON.parse(req.body.imageB64);

  require('./message-controller').saveNewMessage({
    message: message,
    senderUserId: senderUserId,
    receiverUserId: receiverUserId,
    subject: subject,
    att: att,
    origin: req.headers.origin,
  }, function () {
    if (returnTo !== undefined && returnTo != null) {
      res.redirect(returnTo);
    } else {
      res.redirect('/user/public/userId/' + senderUserId);
    }
  });
});

/* Add message reply to database. */
router.post('/addreply', function (req, res) {
  //retrieve data from req object
  let reply = req.body.reply;
  let userId = req.body.userId;
  let messageId = req.body.messageId;
  let att = JSON.parse(req.body.imageB64);

  require('./message-controller').saveNewReplay(messageId, userId, {
    reply: reply,
    userId: userId,
    att: att,
    origin: req.headers.origin
  }, function () {
    res.redirect('/user/messages/id/'+messageId);
  })
  //store news in database

});

router.post('/support_message', function (req, res) {
  let Recaptcha = require('express-recaptcha');
  let recaptcha = new Recaptcha('6Leb9zwUAAAAAEk2Ft01XQmNjuRiiAscYB3ZcRNK', '6Leb9zwUAAAAAM2gLIuDl3_9mKGco4sXzDwCaJ7g');

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