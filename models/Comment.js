/* Comment Model */
module.exports = function (sequelize, DataTypes) {
    var Comment = sequelize.define('Comment', {
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        comment: DataTypes.TEXT,
    }, {
      charset: 'utf8',
      collate: 'utf8_unicode_ci'
    });
    return Comment;
};