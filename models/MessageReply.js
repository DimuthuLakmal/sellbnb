/* Message Model */
module.exports = function (sequelize, DataTypes) {
    var MessageReply = sequelize.define('MessageReply', {
        message: DataTypes.TEXT,
        seen: DataTypes.BOOLEAN,
    }, {
        // Define Associations for User table here.
        classMethods: {
            associate: function (models) {
                MessageReply.belongsTo(models.User);
            }
        }
    });
    return MessageReply;
};