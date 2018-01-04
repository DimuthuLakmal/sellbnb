/**
 * Created by kjtdi on 5/26/2017.
 */
let express = require('express');
let _ = require('lodash');
let router = express.Router();
let models = require('./../models');
let sequelize = models.sequelize;
let async = require('async');
let moment = require('moment');

//retreive messages from database for user
/* Usage: Header */
router.get('/userId/:userId', function (req, res) {
    let userId = req.params.userId;
    if(userId!=undefined && userId!=null && userId!='null') {
        //store item in database
        sequelize.sync().then(
            function () {
                let RecentSearchCommodity = models.RecentSearchCommodity;

                //find user's recentsearches
                RecentSearchCommodity.aggregate('CommodityId', 'DISTINCT',{
                    plain: false,
                    where: {UserId: userId},
                    limit: 3,
                    order: '`id` DESC',
                }).then(function (RecentSearches) {
                    let CommodityArr = [];
                    if(RecentSearches.length == 0){
                        CommodityArr = [];
                        sequelize.query("SELECT count(id) as count, CommodityId FROM Items GROUP BY CommodityId ORDER BY count DESC", { type: sequelize.QueryTypes.SELECT})
                            .then(function(Commodities) {

                                async.forEach(Commodities, function(commodity, callback1) {

                                    if(commodity.count != 0) {
                                        models.Item.findAll({
                                            where:{
                                                duration: {
                                                    gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))
                                                },
                                                CommodityId: commodity.CommodityId,
                                            },
                                            limit: 3,
                                            include:[models.User,models.ItemImage]
                                        }).then(function (PopularItems) {
                                            CommodityArr.push(PopularItems);
                                            callback1(null);
                                        });
                                    }

                                }, function (err) {
                                    req.session.recentsearches = CommodityArr;
                                    res.redirect('/');
                                });
                            });
                    } else if(RecentSearches.length >= 1) {
                        async.forEach(RecentSearches, function(commodity, callback1) {
                            let commodityId = commodity.DISTINCT;
                            models.Item.findAll({
                                where: {
                                    CommodityId: commodityId,
                                    duration: {
                                        gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))
                                    },
                                },
                                limit: 3,
                                include: [models.User,models.ItemImage],
                            }).then(function (Items) {
                                CommodityArr.push(Items);
                                callback1(null);
                            });
                        }, function (err) {
                            //pushing retrieved data to commodity array

                            let itemCount = 0;
                            let itemArr = [];

                            async.forEach(CommodityArr, function(itemsInCommodity, callback1) {
                                itemCount += itemsInCommodity.length;

                                async.forEach(itemsInCommodity, function(item, callback2) {
                                    itemArr.push({id: {$ne: item.dataValues.id}});
                                    callback2(null);
                                }, callback1);

                            }, function (err) {
                                sequelize.query("SELECT count(id) as count, CommodityId FROM Items GROUP BY CommodityId ORDER BY count DESC", { type: sequelize.QueryTypes.SELECT})
                                    .then(function(Commodities) {

                                        async.forEach(Commodities, function(commodity, callback1) {

                                            if(commodity.count != 0) {
                                                models.Item.findAll({
                                                    where:{
                                                        duration: {
                                                            gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))
                                                        },
                                                        CommodityId: commodity.CommodityId,
                                                        $and: itemArr,
                                                    },
                                                    limit: 3,
                                                    include: [models.User,models.ItemImage],
                                                }).then(function (PopularItems) {
                                                    CommodityArr.push(PopularItems);
                                                    callback1(null);
                                                });
                                            }

                                        }, function (err) {
                                            req.session.recentsearches = CommodityArr;
                                            res.redirect('/');
                                        });
                                });

                            });
                        });
                    }
                });
            }
        );
    } else {
        let CommodityArr = [];
        sequelize.query("SELECT count(id) as count, CommodityId FROM Items GROUP BY CommodityId ORDER BY count DESC", { type: sequelize.QueryTypes.SELECT})
            .then(function(Commodities) {

                async.forEach(Commodities, function(commodity, callback1) {

                    if(commodity.count != 0) {
                        models.Item.findAll({
                            where:{
                                duration: {
                                    gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))
                                },
                                CommodityId: commodity.CommodityId,
                            },
                            limit: 3,
                            include: [models.User,models.ItemImage],
                        }).then(function (PopularItems) {
                            CommodityArr.push(PopularItems);
                            callback1(null);
                        });
                    }

                }, function (err) {
                    req.session.recentsearches = CommodityArr;
                    res.redirect('/');
                });
            });
    }
});

router['methods'] = {
    resentSearch : function (req, next) {
        let userId = req.user ? req.user.userId : null;
        if(userId!=undefined && userId!=null && userId!='null') {
            //store item in database
            sequelize.sync().then(
                function () {
                    let RecentSearchCommodity = models.RecentSearchCommodity;

                    //find user's recentsearches
                    RecentSearchCommodity.aggregate('CommodityId', 'DISTINCT',{
                        plain: false,
                        where: {UserId: userId},
                        limit: 3,
                        order: '`id` DESC',
                    }).then(function (RecentSearches) {
                        let CommodityArr = [];
                        if(RecentSearches.length == 0){
                            CommodityArr = [];
                            sequelize.query("SELECT count(id) as count, CommodityId FROM Items GROUP BY CommodityId ORDER BY count DESC", { type: sequelize.QueryTypes.SELECT})
                                .then(function(Commodities) {

                                    async.forEach(Commodities, function(commodity, callback1) {

                                        if(commodity.count != 0) {
                                            models.Item.findAll({
                                                where:{
                                                    duration: {
                                                        gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))
                                                    },
                                                    CommodityId: commodity.CommodityId,
                                                },
                                                limit: 3,
                                                include:[models.User,models.ItemImage]
                                            }).then(function (PopularItems) {
                                                CommodityArr.push(PopularItems);
                                                callback1(null);
                                            });
                                        }

                                    }, function (err) {
                                        // req.session.recentsearches = CommodityArr;
                                        // res.redirect('/');
                                        next(CommodityArr);
                                    });
                                });
                        } else if(RecentSearches.length >= 1) {
                            async.forEach(RecentSearches, function(commodity, callback1) {
                                let commodityId = commodity.DISTINCT;
                                models.Item.findAll({
                                    where: {
                                        CommodityId: commodityId,
                                        duration: {
                                            gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))
                                        },
                                    },
                                    limit: 3,
                                    include: [models.User,models.ItemImage],
                                }).then(function (Items) {
                                    CommodityArr.push(Items);
                                    callback1(null);
                                });
                            }, function (err) {
                                //pushing retrieved data to commodity array

                                let itemCount = 0;
                                let itemArr = [];

                                async.forEach(CommodityArr, function(itemsInCommodity, callback1) {
                                    itemCount += itemsInCommodity.length;

                                    async.forEach(itemsInCommodity, function(item, callback2) {
                                        itemArr.push({id: {$ne: item.dataValues.id}});
                                        callback2(null);
                                    }, callback1);

                                }, function (err) {
                                    sequelize.query("SELECT count(id) as count, CommodityId FROM Items GROUP BY CommodityId ORDER BY count DESC", { type: sequelize.QueryTypes.SELECT})
                                        .then(function(Commodities) {

                                            async.forEach(Commodities, function(commodity, callback1) {

                                                if(commodity.count != 0) {
                                                    models.Item.findAll({
                                                        where:{
                                                            duration: {
                                                                gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))
                                                            },
                                                            CommodityId: commodity.CommodityId,
                                                            $and: itemArr,
                                                        },
                                                        limit: 3,
                                                        include: [models.User,models.ItemImage],
                                                    }).then(function (PopularItems) {
                                                        CommodityArr.push(PopularItems);
                                                        callback1(null);
                                                    });
                                                }

                                            }, function (err) {
                                                // req.session.recentsearches = CommodityArr;
                                                // res.redirect('/');
                                                next(CommodityArr);
                                            });
                                        });

                                });
                            });
                        }
                    });
                }
            );
        } else {
            let CommodityArr = [];
            sequelize.query("SELECT count(id) as count, CommodityId FROM Items GROUP BY CommodityId ORDER BY count DESC", { type: sequelize.QueryTypes.SELECT})
                .then(function(Commodities) {

                    async.forEach(Commodities, function(commodity, callback1) {

                        if(commodity.count != 0) {
                            models.Item.findAll({
                                where:{
                                    duration: {
                                        gte: sequelize.fn("TIME_TO_SEC", sequelize.fn('timediff',moment().format(),sequelize.col("Item.createdAt")))
                                    },
                                    CommodityId: commodity.CommodityId,
                                },
                                limit: 3,
                                include: [models.User,models.ItemImage],
                            }).then(function (PopularItems) {
                                CommodityArr.push(PopularItems);
                                callback1(null);
                            });
                        }

                    }, function (err) {
                        // req.session.recentsearches = CommodityArr;
                        // res.redirect('/');
                        next(CommodityArr);
                    });
                });
        }
    }
};

module.exports = router;