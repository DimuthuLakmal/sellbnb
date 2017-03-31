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
        rate_quality: DataTypes.DOUBLE,
        rate_delivery: DataTypes.DOUBLE,
        rate_reliablity_seller: DataTypes.DOUBLE,
        payment: DataTypes.DOUBLE,
        efficiency: DataTypes.DOUBLE,
        rate_reliablity_buyer: DataTypes.DOUBLE,
        no_of_ratings_quality: DataTypes.INTEGER,
        no_of_ratings_delivery: DataTypes.INTEGER,
        no_of_ratings_reliablity_seller: DataTypes.INTEGER,
        no_of_ratings_payment: DataTypes.INTEGER,
        no_of_ratings_efficiency: DataTypes.INTEGER,
        no_of_ratings_reliablity_buyer: DataTypes.INTEGER,
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
                User.hasMany(models.Notification);
            }
        }
    });
    return User;
};