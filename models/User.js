/* User Model */
module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define('User', {
        username: DataTypes.STRING,
        password: DataTypes.STRING,
        full_name: DataTypes.STRING,
        company_name: DataTypes.STRING,
        location: DataTypes.STRING,
    },{
        //Define Association for User
        classMethods: {
            associate: function (models) {
                User.hasMany(models.News);
            }
        }
    });
    return User;
};