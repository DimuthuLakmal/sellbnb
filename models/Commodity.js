/**
 * Created by kjtdi on 1/23/2017.
 */
/* Commodity Model */
module.exports = function (sequelize, DataTypes) {
    var Commodity = sequelize.define('Commodity', {
        name: DataTypes.STRING,
        segment: DataTypes.STRING,
        family: DataTypes.STRING,
        class: DataTypes.STRING,
        measureUnit: DataTypes.STRING,
        specification: DataTypes.TEXT,
        hits: DataTypes.INTEGER,
    }, {
      charset: 'utf8',
      collate: 'utf8_unicode_ci',
      // Define Associations for Commodity Table here.
        classMethods: {
            associate: function (models) {
                Commodity.hasMany(models.CommodityParameter);
                Commodity.hasMany(models.CommodityAlterName);
                Commodity.hasMany(models.CommodityImage);
                Commodity.hasMany(models.CommodityMeasureUnit);
                Commodity.hasMany(models.CommodityPriceUnit);
                Commodity.hasMany(models.CommodityPacking);
            }
        }
    });
    return Commodity;
};