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
    }, {
        // Define Associations for Commodity Table here.
        classMethods: {
            associate: function (models) {
                Commodity.hasMany(models.CommodityParameter);
                Commodity.hasMany(models.CommodityAlterName);
            }
        }
    });
    return Commodity;
};