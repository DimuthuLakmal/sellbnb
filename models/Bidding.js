/**
 * Created by kjtdi on 1/23/2017.
 */
/* Bidding Model */
module.exports = function (sequelize, DataTypes) {
    var Bidding = sequelize.define('Bidding', {
        bid: DataTypes.STRING,
        quantity: DataTypes.STRING,
        packageType: DataTypes.STRING,
        deliveryBy: DataTypes.STRING,
        deliveryCost: DataTypes.STRING,
        deliveryDate: DataTypes.STRING,
        paymentTerms: DataTypes.STRING,
        note: DataTypes.STRING,
        status: DataTypes.STRING,
    }, {
        // Define Associations for Bidding table here.
        classMethods: {
            associate: function (models) {
                Bidding.belongsTo(models.User);
                Bidding.belongsTo(models.WareHouse);
                Bidding.belongsTo(models.Item);
            }
        }
    });
    return Bidding;
};