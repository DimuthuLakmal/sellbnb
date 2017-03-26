/**
 * Created by kjtdi on 1/23/2017.
 */
/* Commodity Price Units Model */
module.exports = function (sequelize, DataTypes) {
    var CommodityPriceUnit = sequelize.define('CommodityPriceUnit', {
        unitName: DataTypes.STRING,
    });
    return CommodityPriceUnit;
};