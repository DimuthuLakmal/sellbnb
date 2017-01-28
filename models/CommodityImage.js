/* Commodity Alternative Names Model */
module.exports = function (sequelize, DataTypes) {
    var CommodityImage = sequelize.define('CommodityImage', {
        url: DataTypes.STRING,
    });
    return CommodityImage;
};