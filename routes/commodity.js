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
                res.sendStatus(200);
            });
        }
    ).catch(function (error) {
        console.log(error);
    });

    res.redirect('/addnews');
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


module.exports = router;