/* News Model */
module.exports = function (sequelize, DataTypes) {
    var News = sequelize.define('News', {
        title: DataTypes.STRING,
        category: DataTypes.STRING,
        content: DataTypes.TEXT,
        hits: DataTypes.INTEGER,
    }, {
        // Define Associations for News table here.
        classMethods: {
            associate: function (models) {
                News.belongsTo(models.User);
                News.hasMany(models.Comment);
            }
        }
    });
    return News;
};