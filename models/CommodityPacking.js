/**
 * Created by Dimuthu on 4/18/2017.
 */
/* Commodity Measurements Units Model */
module.exports = function (sequelize, DataTypes) {
    var CommodityPacking = sequelize.define('CommodityPacking', {
        type: DataTypes.STRING,
    }, {
      charset: 'utf8',
      collate: 'utf8_unicode_ci'
    });
    return CommodityPacking;
};