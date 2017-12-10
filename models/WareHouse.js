/**
 * Created by kjtdi on 1/23/2017.
 */
/* Warehouse Model */
module.exports = function (sequelize, DataTypes) {
    var WareHouse = sequelize.define('WareHouse', {
        warehouseAddress1: DataTypes.STRING,
        warehouseAddress2: DataTypes.STRING,
        warehouseCity: DataTypes.STRING,
    }, {
      charset: 'utf8',
      collate: 'utf8_unicode_ci'
    });
    return WareHouse;
};