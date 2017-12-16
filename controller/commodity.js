/**
 * Created by kjtdi on 3/11/2017.
 */
var _ = require('lodash');
var models = require('../models');
var sequelize = models.sequelize;
var async = require('async');

var getCommodityName = function () {
    var commodityNames = [];
    async.waterfall([
        function (callback) {
            sequelize.sync().then(
                function () {
                    var Commodity = models.Commodity;
                    Commodity.findAndCountAll().then(function (Commodities) {
                        //saving commodity names to the array and redirect after set the names to session
                        _.forEach(Commodities.rows, function(commodity, index) {
                            commodityNames.push(commodity.dataValues.name);
                        });
                        callback(null,commodityNames);
                    });
                }
            );
        }],
        function (err, commodityNames) {
            console.log(commodityNames);
            return commodityNames;
        }
    );

};

exports.getCommodityName = getCommodityName;