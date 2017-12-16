/**
 * Created by kjtdi on 1/23/2017.
 */
/* Business Certificate Model */
module.exports = function (sequelize, DataTypes) {
    var BusinessCertificate = sequelize.define('BusinessCertificate', {
        number: DataTypes.STRING,
        name: DataTypes.STRING,
    }, {
      charset: 'utf8',
      collate: 'utf8_unicode_ci'
    });
    return BusinessCertificate;
};