/**
 * Created by kjtdi on 3/2/2017.
 */
let express = require('express');
let _ = require('lodash');
let router = express.Router();
let models = require('./../models');
let sequelize = models.sequelize;
let fs = require('fs');
// let helper = require('sendgrid').mail;
let async = require('async');
const sgAPI = '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';

//store notification details in database
/* Usage: Buyer Contract Page */
router.get('/add/mutual/type/:type/bidId/:bidId/itemName/:itemName/itemId/:itemId/userId/:userId/requestFrom/:requestFrom', function (req, res) {
    let redirection = '';
    let url = '';
    if (req.params.requestFrom == 'seller') {
        redirection = '/user/sell/contract/bidId/'+req.params.bidId;
        url = '/user/buy/contract/id/'+req.params.itemId+'?bidId='+req.params.bidId;
    } else {
        redirection = '/user/buy/contract/id/'+req.params.itemId+'?bidId='+req.params.bidId;
        url = '/user/sell/contract/bidId/'+req.params.bidId;
    }
    let description = 'Mutual Cancellation Request for item '+req.params.itemName;
    let emailDescription = 'Mutual Cancellation Request for item '+req.params.itemName;
    let subject = 'Mutual Cancellation Request';
    addNotification(res, req, url , description, emailDescription, subject, redirection);
});

//store notification details in database
/* Usage: User Accout Seller Page (Accept Bid) */
router.get('/add/accept/itemId/:itemId/bidId/:bidId/userId/:userId/itemName/:itemName', function (req, res) {
    let redirection = '/user/sell/bids/start/0?itemId='+req.params.itemId;
    let url = '/user/buy/list/start/0,0,0?buyingpageItemOption=Cancelled&openDurationOption=1&pendingDurationOption=1&cancelledDurationOption=1';
    let description = 'Your Bid is accepted for '+req.params.itemName;
    let emailDescription = 'Your Bid is accepted for '+req.params.itemName;
    let subject = 'Your Bid has accepted!';
    addNotification(res, req, url , description, emailDescription, subject, redirection);
});

//retreive notification details from database
/* Usage: Header */
router.get('/userId/:userId', function (req, res) {
    let UserId = req.params.userId;

    //store item in database
    sequelize.sync().then(
        function () {
            let Notification = models.Notification;

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
    let id = req.params.id;

    //update database
    sequelize.sync().then(
        function () {
            let Notification = models.Notification;
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
                    let notification = Notications[0];
                    res.redirect(notification.url);
                });
            });
        }
    );
});

//update notification unseen to seen for userId (clear notifications
/* Usage: Header */
router.get('/update/userId/:userId', function (req, res) {
    let userId = req.params.userId;

    //update database
    sequelize.sync().then(
        function () {
            let Notification = models.Notification;
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
            let Notification = models.Notification;
            Notification.create({
                type: req.params.type,
                description: description,
                url: url,
                seen: false,
                UserId: req.params.userId,
            }).then(function (insertedNotificaion) {
                //sending emails & SMS
                let subject = subject_;
                let message = emailDescription;
                sendEmailSMS(req.params.userId, subject, message, redirection, res);

                // let User = models.User;
                // let Email = models.Email;
                // let PhoneNumber = models.PhoneNumber;
                // User.findAll({
                //     where: {id: req.params.userId},
                //     include: [Email, PhoneNumber],
                // }).then(function (Users) {
                //     //send SMS
                //     let SMSPhoneNumber = Users[0].dataValues.PhoneNumbers[0].dataValues;
                //     console.log(SMSPhoneNumber);
                //
                //     // Twilio Credentials
                //     let accountSid = 'ACb1c6f0ccb34ac2d7aaee85cc8a9d5a34';
                //     let authToken = '8bef9138453179638cc15b3fd197a0ae';
                //
                //     //require the Twilio module and create a REST client
                //     let client = require('twilio')(accountSid, authToken);
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

//sending emails using sendgrid
function sendEmailSMS(userId, subject_, message, redirection, res) {

    //retrive user's emails address
    sequelize.sync().then(
        function () {
            let User = models.User;
            let Email = models.Email;
            let PhoneNumber = models.PhoneNumber;
            User.findAll({
                where: {id: userId},
                include: [Email, PhoneNumber],
            }).then(function (Users) {

                async.waterfall([

                    function(callback){
                        EmailAddress = Users[0].dataValues.Emails[0].dataValues.email;

                        // let helper = require('sendgrid').mail;
                        //
                        // from_email = new helper.Email("sellbnb@gmail.com");
                        // to_email = new helper.Email(EmailAddress);
                        // subject = subject_;
                        // content = new helper.Content("text/plain", message);
                        // mail = new helper.Mail(from_email, subject, to_email, content);
                        //
                        // let sg = require('sendgrid')(sgAPI);
                        // let request = sg.emptyRequest({
                        //     method: 'POST',
                        //     path: '/v3/mail/send',
                        //     body: mail.toJSON()
                        // });
                        //
                        // sg.API(request, function(error, response) {
                        //     console.log(response.statusCode);
                        //     console.log(response.body);
                        //     console.log(response.headers);
                        //     callback(null);
                        // });

                    },
                    function (callback) {
                        //send SMS
                        let SMSPhoneNumber = Users[0].dataValues.PhoneNumbers[0].dataValues;

                        // Twilio Credentials
                        let accountSid = 'ACb1c6f0ccb34ac2d7aaee85cc8a9d5a34';
                        let authToken = '8bef9138453179638cc15b3fd197a0ae';

                        //require the Twilio module and create a REST client
                        let client = require('twilio')(accountSid, authToken);

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
    //get emails & mobile number details of user
    let EmailAddress = null;
    sequelize.sync().then(
        function () {
            let User = models.User;
            let Email = models.Email;
            let PhoneNumber = models.PhoneNumber;
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