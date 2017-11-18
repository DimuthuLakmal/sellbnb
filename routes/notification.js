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
const sgAPI = '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';

//store notification details in database
/* Usage: Buyer Contract Page */
router.get('/add/mutual/type/:type/bidId/:bidId/itemName/:itemName/itemId/:itemId/userId/:userId/requestFrom/:requestFrom', function (req, res) {
    var redirection = '';
    var url = '';
    if (req.params.requestFrom == 'seller') {
        redirection = '/user/sell/contract/bidId/'+req.params.bidId;
        url = '/user/buy/contract/id/'+req.params.itemId+'?bidId='+req.params.bidId;
    } else {
        redirection = '/user/buy/contract/id/'+req.params.itemId+'?bidId='+req.params.bidId;
        url = '/user/sell/contract/bidId/'+req.params.bidId;
    }
    var description = 'Mutual Cancellation Request for item '+req.params.itemName;
    var emailDescription = 'Mutual Cancellation Request for item '+req.params.itemName;
    var subject = 'Mutual Cancellation Request';
    addNotification(res, req, url , description, emailDescription, subject, redirection);
});

//store notification details in database
/* Usage: User Accout Seller Page (Accept Bid) */
router.get('/add/accept/itemId/:itemId/bidId/:bidId/userId/:userId/itemName/:itemName', function (req, res) {
    var redirection = '/user/sell/bids/start/0?itemId='+req.params.itemId;
    var url = '/user/buy/list/start/0,0,0?buyingpageItemOption=Cancelled&openDurationOption=1&pendingDurationOption=1&cancelledDurationOption=1';
    var description = 'Your Bid is accepted for '+req.params.itemName;
    var emailDescription = 'Your Bid is accepted for '+req.params.itemName;
    var subject = 'Your Bid has accepted!';
    addNotification(res, req, url , description, emailDescription, subject, redirection);
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
                res.redirect(req.session.returnToCommodityName);
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

//update notification unseen to seen for userId (clear notifications
/* Usage: Header */
router.get('/update/userId/:userId', function (req, res) {
    var userId = req.params.userId;

    //update database
    sequelize.sync().then(
        function () {
            var Notification = models.Notification;
            Notification.update(
                { seen: true },
                { where: { UserId: userId } }
            ).then(function (results) {
                //find url to notification and redirect
                res.redirect('/');
            });
        }
    );
});

function addNotification(res, req, url, description, emailDescription, subject_, redirection) {
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
                var subject = subject_;
                var message = emailDescription;
                sendEmailSMS(req.params.userId, subject, message, redirection, res);

                // var User = models.User;
                // var Email = models.Email;
                // var PhoneNumber = models.PhoneNumber;
                // User.findAll({
                //     where: {id: req.params.userId},
                //     include: [Email, PhoneNumber],
                // }).then(function (Users) {
                //     //send SMS
                //     var SMSPhoneNumber = Users[0].dataValues.PhoneNumbers[0].dataValues;
                //     console.log(SMSPhoneNumber);
                //
                //     // Twilio Credentials
                //     var accountSid = 'ACb1c6f0ccb34ac2d7aaee85cc8a9d5a34';
                //     var authToken = '8bef9138453179638cc15b3fd197a0ae';
                //
                //     //require the Twilio module and create a REST client
                //     var client = require('twilio')(accountSid, authToken);
                //
                //     client.sendMessage({
                //         to: SMSPhoneNumber.number,
                //         from: "+12569987739 ",
                //         body: "You have received Mutual Cancellation Request",
                //     }, function(err, message) {
                //         if(err) {
                //             console.log(err);
                //         } else {
                //             console.log(redirection);
                //             res.redirect(redirection);
                //             console.log(message);
                //         }
                //     });
                //
                //     //res.redirect(redirection);
                // });
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
}

//sending email using sendgrid
function sendEmailSMS(userId, subject_, message, redirection, res) {

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
                        EmailAddress = Users[0].dataValues.Emails[0].dataValues.email;

                        var helper = require('sendgrid').mail;

                        from_email = new helper.Email("sellbnb@gmail.com");
                        to_email = new helper.Email(EmailAddress);
                        subject = subject_;
                        content = new helper.Content("text/plain", message);
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
                            callback(null);
                        });

                    },
                    function (callback) {
                        //send SMS
                        var SMSPhoneNumber = Users[0].dataValues.PhoneNumbers[0].dataValues;

                        // Twilio Credentials
                        var accountSid = 'ACb1c6f0ccb34ac2d7aaee85cc8a9d5a34';
                        var authToken = '8bef9138453179638cc15b3fd197a0ae';

                        //require the Twilio module and create a REST client
                        var client = require('twilio')(accountSid, authToken);

                        client.sendMessage({
                            to: SMSPhoneNumber.number,
                            from: "+12569987739 ",
                            body: "You have received Mutual Cancellation Request",
                        }, function(err, message) {
                            if(err) {
                                console.log(err);
                            } else {
                                console.log(message);
                            }
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