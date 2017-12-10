/* Commodity Alternative Names Model */
module.exports = function (sequelize, DataTypes) {
    var CommodityAlterName = sequelize.define('CommodityAlterName', {
        name: DataTypes.STRING,
    }, {
      charset: 'utf8',
      collate: 'utf8_unicode_ci'
    });
    return CommodityAlterName;
};