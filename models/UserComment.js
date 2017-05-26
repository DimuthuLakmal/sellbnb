/* User Comment Model */
module.exports = function (sequelize, DataTypes) {
    var UserComment = sequelize.define('UserComment', {
        comment: DataTypes.TEXT,
        rate_quality: DataTypes.DOUBLE,
        rate_delivery: DataTypes.DOUBLE,
        rate_reliablity_seller: DataTypes.DOUBLE,
        payment: DataTypes.DOUBLE,
        efficiency: DataTypes.DOUBLE,
        rate_reliablity_buyer: DataTypes.DOUBLE,
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