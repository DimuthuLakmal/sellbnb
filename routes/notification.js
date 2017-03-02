/**
 * Created by kjtdi on 3/2/2017.
 */
var express = require('express');
var _ = require('lodash');
var router = express.Router();
var models = require('./../models');
var sequelize = models.sequelize;
var fs = require('fs');

//store notification details in database
/* Usage: Buyer Contract Page */
router.get('/add/mutual/type/:type/itemName/:itemName/itemId/:itemId/userId/:userId', function (req, res) {
    var redirection = '/user/buy/contract/id/'+req.params.itemId;
    var url = '/user/sell/contract/id/'+req.params.itemId;
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
                res.redirect(redirection);
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
}

module.exports = router;