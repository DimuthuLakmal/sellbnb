/* User Comment Model */
module.exports = function (sequelize, DataTypes) {
    var UserComment = sequelize.define('UserComment', {
        comment: DataTypes.TEXT,
    }, {
        // Define Associations for Item table here.
        classMethods: {
            associate: function (models) {
                UserComment.belongsTo(models.User, {
                    as: 'receivedUserId',
                    foreignKey: 'receivedUserIdFk'
                });

                UserComment.belongsTo(models.User, {
                    as: 'feedbackUserId',
                    foreignKey: 'feedbackUserIdFk'
                });
            }
        }
    });
    return UserComment;
};