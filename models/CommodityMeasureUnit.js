/**
 * Created by kjtdi on 1/23/2017.
 */
/* Commodity Measurements Units Model */
module.exports = function (sequelize, DataTypes) {
    var CommodityMeasureUnit = sequelize.define('CommodityMeasureUnit', {
        unitName: DataTypes.STRING,
    });
    return CommodityMeasureUnit;
};