/**
 * Created by kjtdi on 1/23/2017.
 */
/* Commodity Parameters Model */
module.exports = function (sequelize, DataTypes) {
    var CommodityParameter = sequelize.define('CommodityParameter', {
        name: DataTypes.STRING,
        value: DataTypes.STRING,
    });
    return CommodityParameter;
};