var express = require('express');
var _ = require('lodash');
var router = express.Router();
var models = require('./../models');
var sequelize = models.sequelize;
var fs = require('fs');
var path = require('path');


/* POST request to store commodities in database */
router.post('/add', function (req, res, next) {
    //retrive data from reqeust header
    var name = req.body.name;
    var segment = req.body.segment;
    var family = req.body.family;
    var classOfCommodity = req.body.classOfCommodity;
    var measureUnit = req.body.measureUnit;
    var specification = req.body.specification;
    var parameters = req.body.parameters;
    var alternativeNames = req.body.alternativeNames;
    var measureUnits = req.body.measureUnits;
    var priceUnits = req.body.priceUnits;

    console.log(parameters);

    _.forEach(req.body.images, function(image, index) {
        var imageBuffer = decodeBase64Image(image.data); //decoding base64 images
        fs.writeFile('public/uploads/commodity/'+image.filename, imageBuffer.data, function(err) {
            console.log(err);
        });
    });

    //store commodity in database
    sequelize.sync().then(
        function () {
            var insertedCommodityId = -1;
            var Commodity = models.Commodity;
            Commodity.create({
                name: name,
                family: family,
                class: classOfCommodity,
                segment: segment,
                measureUnit: measureUnit,
                specification: specification
            }).then(function (insertedCommodity) {
                console.log(insertedCommodity.dataValues);
                //store commodity parameters
                var CommodityParameter = models.CommodityParameter;
                insertedCommodityId = insertedCommodity.dataValues.id;
                _.forEach(parameters, function(parameter, index) {
                    CommodityParameter.create({
                        name: parameter.parameter_name,
                        value: parameter.parameter_value,
                        CommodityId: insertedCommodityId,
                    });
                });
            }).then(function () {
                //store commodity images
                var CommodityImage = models.CommodityImage;
                _.forEach(req.body.images, function(image, index) {
                    CommodityImage.create({
                        url: image.filename,
                        CommodityId: insertedCommodityId,
                    });
                });
            }).then(function () {
                //store commodity alernative names
                var CommodityAlterName = models.CommodityAlterName;
                _.forEach(alternativeNames, function(alternativeName, index) {
                    CommodityAlterName.create({
                        name: alternativeName,
                        CommodityId: insertedCommodityId,
                    });
                });
            }).then(function () {
                //store commodity measureUnits
                var CommodityMeasureUnit = models.CommodityMeasureUnit;
                _.forEach(measureUnits, function(measureUnit, index) {
                    CommodityMeasureUnit.create({
                        unitName : measureUnit,
                        CommodityId: insertedCommodityId,
                    });
                });
            }).then(function () {
                //store commodity measureUnits
                var CommodityPriceUnit = models.CommodityPriceUnit;
                _.forEach(priceUnits, function(priceUnit, index) {
                    CommodityPriceUnit.create({
                        unitName : priceUnit,
                        CommodityId: insertedCommodityId,
                    });
                });
            }).then(function () {
                res.sendStatus(200);
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});

//function to decode base64 image
function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}


/* Retrieve all commodities from database*/
router.get('/viewall', function (req, res) {
    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var Commodity = models.Commodity;
            // var CommodityImage = models.CommodityImage;
            // var CommodityAlterName = models.CommodityAlterName;
            // var CommodityAlterName = models.CommodityAlterName;
            Commodity.findAndCountAll().then(function (Commodities) {
                //saving news array to a session and redirect
                req.session.commodities = Commodities;
                res.redirect('/items/search');
            });
        }
    );
});


/* Retrieve all commodities from database*/
/* Usage: Main Menu */
router.get('/names', function (req, res) {
    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var Commodity = models.Commodity;
            Commodity.findAndCountAll().then(function (Commodities) {
                var commodityNames = [];
                //saving commodity names to the array and redirect after set the names to session
                _.forEach(Commodities.rows, function(commodity, index) {
                    commodityNames.push(commodity.dataValues.name);
                });
                req.session.commodityNames = commodityNames;
                res.redirect(req.session.returnToCommodityName);
            });
        }
    );
});

/* Retrieve measurement Units from database*/
/* Usage: Item Add Page*/
router.get('/measureUnits/id/:id', function (req, res) {
    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var CommodityMeasureUnit = models.CommodityMeasureUnit;
            var CommodityPriceUnit = models.CommodityPriceUnit;
            CommodityMeasureUnit.findAll({
                where: {CommodityId: req.params.id},
            }).then(function (measureUnits) {
                //saving commodity measure units
                req.session.measureUnits = measureUnits;

                CommodityPriceUnit.findAll({
                    where: {CommodityId: req.params.id},
                }).then(function (priceUnits) {
                    //saving commodity measure units
                    req.session.priceUnits = priceUnits;
                    res.redirect('/items/add');
                });
            });
        }
    );
});


/* Retrieve popluar commodities from database */
router.get('/viewpopular', function (req, res) {
    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var Commodity = models.Commodity;
            var CommodityImage = models.CommodityImage;
            Commodity.findAndCountAll({
                limit: 10,
                include: [CommodityImage],
                order: '`hits` DESC'
            }).then(function (Commodities) {
                var commoditiesArr = [];
                //pushing retrieved data to commodity array
                _.forEach(Commodities.rows, function(commodity, index) {
                    var id = commodity.id;
                    var name = commodity.name;

                    commoditiesArr.push({'id': id, 'name': name, 'images': commodity.CommodityImages});
                });
                req.session.commodityPopular = commoditiesArr;
                res.redirect('/');
            });
        }
    );
});


/* Retrieve specific commodity from database */
/* Usage: searchcommodityadd page */
router.post('/search', function (req, res) {
    //extract name of commodity
    var commodityName = req.body.commodity;

    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var Commodity = models.Commodity;
            var CommodityAlterName = models.CommodityAlterName;
            var CommodityParameter = models.CommodityParameter;
            var CommodityImage = models.CommodityImage;
            var CommodityMeasureUnit = models.CommodityMeasureUnit;

            Commodity.findAll({
                where: {name: commodityName},
                include: [CommodityAlterName,CommodityParameter,CommodityImage, CommodityMeasureUnit],
            }).then(function (Commodity) {
                var commodity = Commodity[0].dataValues;
                req.session.commodity = commodity;

                res.redirect('/items/add/commoditydetails');
            });
        }
    );
});

module.exports = router;