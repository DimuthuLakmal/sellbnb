/* Comment Model */
module.exports = function (sequelize, DataTypes) {
    var Comment = sequelize.define('Comment', {
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        comment: DataTypes.TEXT,
    });
    return Comment;
};