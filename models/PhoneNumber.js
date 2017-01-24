/**
 * Created by kjtdi on 1/23/2017.
 */
/* Phone Number Model */
module.exports = function (sequelize, DataTypes) {
    var PhoneNumber = sequelize.define('PhoneNumber', {
        number: DataTypes.STRING,
    });
    return PhoneNumber;
};