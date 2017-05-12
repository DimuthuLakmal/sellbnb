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

    //store news in database
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

/* Add message reply to database. */
router.post('/addreply', function (req, res) {
    //retrieve data from req object
    var reply = req.body.reply;
    var userId = req.body.userId;
    var messageId = req.body.messageId;

    //store news in database
    sequelize.sync().then(
        function () {
            var MessageReply = models.MessageReply;
            var Message = models.Message;
            MessageReply.create({
                message: reply,
                MessageId: messageId,
                seen: false,
                UserId: userId,
            }).then(function (insertedMessageReply) {
                Message.update(
                    { seen: 1 },
                    { where: { id: messageId } }
                ).then(function (results) {
                    res.redirect('/user/messages/id/'+messageId);
                });
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
                    receiverUserIdFk: UserId,
                    $or: [{seen: 0}, {seen: 1}],
                },
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
                    receiverUserIdFk: UserId,
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
                    senderUserIdFk: UserId,
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
            Message.update(
                { seen: 2 },
                { where: { id: id } }
            ).then(function (results) {
                Message.findAll({
                    where: {
                        id: id,
                    },
                    include: [{
                        model: User,
                        as: 'senderUserId'
                    }]
                }).then(function (Messages) {
                    console.log(Messages[0]);

                    MessageReply.findAll({
                        where: {MessageId: Messages[0].dataValues.id},
                        include: [User],
                    }).then(function (MessageReplies) {
                        req.session.messageReplies = MessageReplies;
                        req.session.messageDetails = Messages[0];
                        res.redirect('/user/messages/id/'+id);
                    });

                });
            });
        }
    );
});

module.exports = router;