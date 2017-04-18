/**
 * Created by Dimuthu on 4/18/2017.
 */
/* Commodity Measurements Units Model */
module.exports = function (sequelize, DataTypes) {
    var CommodityPacking = sequelize.define('CommodityPacking', {
        type: DataTypes.STRING,
    });
    return CommodityPacking;
};