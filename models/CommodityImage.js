/* Commodity Alternative Names Model */
module.exports = function (sequelize, DataTypes) {
    var CommodityImage = sequelize.define('CommodityImage', {
        url: DataTypes.STRING,
    }, {
      charset: 'utf8',
      collate: 'utf8_unicode_ci'
    });
    return CommodityImage;
};