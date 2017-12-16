/**
 * Created by kjtdi on 1/23/2017.
 */
/* Warehouse Model */
module.exports = function (sequelize, DataTypes) {
    var PaymentInformation = sequelize.define('PaymentInformation', {
        bankAccountNo: DataTypes.STRING,
        accountType: DataTypes.STRING,
        accountName: DataTypes.STRING,
        bankName: DataTypes.STRING,
        bankCountry: DataTypes.STRING,
        bankCBranch: DataTypes.STRING,
    }, {
      charset: 'utf8',
      collate: 'utf8_unicode_ci'
    });
    return PaymentInformation;
};