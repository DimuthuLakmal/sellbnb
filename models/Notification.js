/**
 * Created by kjtdi on 1/23/2017.
 */
/* Phone Number Model */
module.exports = function (sequelize, DataTypes) {
    var Notification = sequelize.define('Notification', {
        type: DataTypes.STRING,
        description: DataTypes.TEXT,
        url: DataTypes.TEXT,
        seen: DataTypes.BOOLEAN,
    }, {
      charset: 'utf8',
      collate: 'utf8_unicode_ci'
    });
    return Notification;
};