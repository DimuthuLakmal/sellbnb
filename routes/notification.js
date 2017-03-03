/**
 * Created by kjtdi on 3/2/2017.
 */
var express = require('express');
var _ = require('lodash');
var router = express.Router();
var models = require('./../models');
var sequelize = models.sequelize;
var fs = require('fs');
var helper = require('sendgrid').mail;
var async = require('async');

//store notification details in database
/* Usage: Buyer Contract Page */
router.get('/add/mutual/type/:type/bidId/:bidId/itemName/:itemName/itemId/:itemId/userId/:userId/requestFrom/:requestFrom', function (req, res) {
    var redirection = '';
    var url = ''
    if (req.params.requestFrom == 'seller') {
        redirection = '/user/sell/contract/bidId/'+req.params.itemId;
        url = '/user/buy/contract/id/'+req.params.itemId;
    } else {
        redirection = '/user/buy/contract/id/'+req.params.itemId;
        url = '/user/sell/contract/bidId/'+req.params.itemId;
    }
    var description = 'Mutual Cancellation Request for item '+req.params.itemName;
    addNotification(res, req, url , description, redirection);
});

//retreive notification details from database
/* Usage: Header */
router.get('/userId/:userId', function (req, res) {
    var UserId = req.params.userId;

    //store item in database
    sequelize.sync().then(
        function () {
            var Notification = models.Notification;

            //find user's notification
            Notification.findAll({
                where: {
                    UserId: UserId,
                    seen: false,
                },
            }).then(function (Notications) {
                req.session.notifications = Notications;
                res.redirect('/');
            });
        }
    );
});

//update notification unseen to seen and visit notification cause
/* Usage: Header */
router.get('/update/id/:id', function (req, res) {
    var id = req.params.id;

    //update database
    sequelize.sync().then(
        function () {
            var Notification = models.Notification;
            Notification.update(
                { seen: true },
                { where: { id: id } }
            ).then(function (results) {
                //find url to notification and redirect
                Notification.findAll({
                    where: {
                        id: id,
                    },
                }).then(function (Notications) {
                    var notification = Notications[0];
                    res.redirect(notification.url);
                });
            });
        }
    );
});

function addNotification(res, req, url, description, redirection) {
    //store notification in database
    sequelize.sync().then(
        function () {
            var Notification = models.Notification;
            Notification.create({
                type: req.params.type,
                description: description,
                url: url,
                seen: false,
                UserId: req.params.userId,
            }).then(function (insertedNotificaion) {
                //sending email & SMS
                var subject = 'Mutual Cancellation Request';
                var message = 'You have a request to cancel the contract on item ' + req.params.itemName;
                sendEmail(req.params.userId, subject, message, redirection, res);
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
}

//sending email using sendgrid
function sendEmail(userId, subject, message, redirection, res) {

    //retrive user's email address
    sequelize.sync().then(
        function () {
            var User = models.User;
            var Email = models.Email;
            var PhoneNumber = models.PhoneNumber;
            User.findAll({
                where: {id: userId},
                include: [Email, PhoneNumber],
            }).then(function (Users) {

                async.waterfall([

                    function(callback){
                        EmailAddress = Users[0].dataValues.Emails[0].dataValues;

                        //sending email using sendgrid. defining parameters
                        from_email = new helper.Email("kjtdimuthu.13@cse.mrt.ac.lk");
                        to_email = new helper.Email(EmailAddress.email);
                        content = new helper.Content("text/plain", message);
                        mail = new helper.Mail(from_email, subject, to_email, content);

                        var sg = require('sendgrid')('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');
                        var request = sg.emptyRequest({
                            method: 'POST',
                            path: '/v3/mail/send',
                            body: mail.toJSON()
                        });

                        sg.API(request, function(error, response) {
                            console.log(response.statusCode);
                            console.log(response.body);
                            console.log(response.headers);
                            callback(null);
                        });

                    },
                    function (callback) {
                        //send SMS
                        var SMSPhoneNumber = Users[0].dataValues.PhoneNumbers[0].dataValues;
                        console.log(SMSPhoneNumber);

                        // Twilio Credentials
                        var accountSid = 'ACb1c6f0ccb34ac2d7aaee85cc8a9d5a34';
                        var authToken = '8bef9138453179638cc15b3fd197a0ae';

                        //require the Twilio module and create a REST client
                        var client = require('twilio')(accountSid, authToken);

                        client.messages.create({
                            to: SMSPhoneNumber.number,
                            from: "+17542276508",
                            body: "You have received Mutual Cancellation Request",
                        }, function(err, message) {
                            console.log(message);
                        });
                        callback(null,"Success");
                    }
                ], function (err, result) {
                    res.redirect(redirection);
                });

            });
        }
    ).catch(function (error) {
        console.log(error);
    });

}

function retrieveEmailMobileNumber (userId) {
    //get email & mobile number details of user
    var EmailAddress = null;
    sequelize.sync().then(
        function () {
            var User = models.User;
            var Email = models.Email;
            var PhoneNumber = models.PhoneNumber;
            User.findAll({
                where: {id: userId},
                include: [Email, PhoneNumber],
            }).then(function (Users) {
                EmailAddress = Users[0].dataValues.Emails[0].dataValues;
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
}

module.exports = router;