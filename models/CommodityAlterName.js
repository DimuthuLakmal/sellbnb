/* Commodity Alternative Names Model */
module.exports = function (sequelize, DataTypes) {
    var CommodityAlterName = sequelize.define('CommodityAlterName', {
        name: DataTypes.STRING,
    });
    return CommodityAlterName;
};