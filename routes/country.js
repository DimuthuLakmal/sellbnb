var express = require('express');
var _ = require('lodash');
var router = express.Router();
var models = require('./../models');
var sequelize = models.sequelize;


/**
 * Created by kjtdi on 5/21/2017.
 */
/* Retrieve specific news and its comments from database */
router.get('/code/:code', function (req, res) {
    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var Country = models.Country;

            var code = req.params.code;
            Country.findAll({
                where: {code: code},
            }).then(function (Countries) {
                res.jsonp(Countries[0].dataValues);
            });
        }
    );
});

module.exports = router;