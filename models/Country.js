/* User Model */
module.exports = function (sequelize, DataTypes) {
    var Country = sequelize.define('Country', {
        country: DataTypes.STRING,
        code: DataTypes.STRING,
        flag: DataTypes.STRING,
        language: DataTypes.STRING,
    }, {
      charset: 'utf8',
      collate: 'utf8_unicode_ci'
    });
    return Country;
};/**
 * Created by kjtdi on 5/21/2017.
 */
