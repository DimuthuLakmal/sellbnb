/* User Model */
module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define('User', {
        username: DataTypes.STRING,
        password: DataTypes.STRING,
        full_name: DataTypes.STRING,
        company_name: DataTypes.STRING,
        logo: DataTypes.STRING,
        companyIntroduction: DataTypes.TEXT,
        mailingddress1: DataTypes.STRING,
        mailingddress2: DataTypes.STRING,
        mailingCity: DataTypes.STRING,
        website: DataTypes.STRING,
        status: DataTypes.INTEGER,
    },{
        //Define Association for User
        classMethods: {
            associate: function (models) {
                User.hasMany(models.WareHouse);
                User.hasMany(models.PhoneNumber);
                User.hasMany(models.Email);
                User.hasMany(models.TradingCommodity);
                User.hasMany(models.BusinessCertificate);
                User.hasMany(models.PaymentInformation);
            }
        }
    });
    return User;
};