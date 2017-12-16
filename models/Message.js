/* Message Model */
module.exports = function (sequelize, DataTypes) {
    var Message = sequelize.define('Message', {
        subject: DataTypes.STRING,
        message: DataTypes.TEXT,
        att: DataTypes.TEXT,
    }, {
      charset: 'utf8',
      collate: 'utf8_unicode_ci',
      // Define Associations for Item table here.
        classMethods: {
            associate: function (models) {
                Message.belongsTo(models.User, {
                    as: 'receiverUserId',
                    foreignKey: 'receiverUserIdFk'
                });

                Message.belongsTo(models.User, {
                    as: 'senderUserId',
                    foreignKey: 'senderUserIdFk'
                });
                Message.hasMany(models.MessageReply);
            }
        }
    });
    return Message;
};