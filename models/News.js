/* News Model */
module.exports = function (sequelize, DataTypes) {
    var News = sequelize.define('News', {
        english_title: DataTypes.STRING,
        sinhala_title: DataTypes.STRING,
        tamil_title: DataTypes.STRING,
        category: DataTypes.STRING,
        english_content: DataTypes.TEXT,
        sinhala_content: DataTypes.TEXT,
        tamil_content: DataTypes.TEXT,
        english_summary: DataTypes.TEXT,
        sinhala_summary: DataTypes.TEXT,
        tamil_summary: DataTypes.TEXT,
        hits: DataTypes.INTEGER,
        thumbnail: DataTypes.STRING,
        keywords: DataTypes.TEXT,
    }, {
      charset: 'utf8',
      collate: 'utf8_unicode_ci',
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