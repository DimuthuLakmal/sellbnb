/**
 * Created by kjtdi on 1/23/2017.
 */
/* Email Model */
module.exports = function (sequelize, DataTypes) {
    var Email = sequelize.define('Email', {
        email: DataTypes.STRING,
    });
    return Email;
};