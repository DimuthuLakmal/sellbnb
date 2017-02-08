/* Comment Model */
module.exports = function (sequelize, DataTypes) {
    var ItemComment = sequelize.define('ItemComment', {
        comment: DataTypes.TEXT,
        rate: DataTypes.INTEGER,
    }, {
        // Define Associations for Item table here.
        classMethods: {
            associate: function (models) {
                ItemComment.belongsTo(models.User);
            }
        }
    });
    return ItemComment;
};