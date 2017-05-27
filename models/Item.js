/**
 * Created by kjtdi on 1/23/2017.
 */
/* Item Model */
module.exports = function (sequelize, DataTypes) {
    var Item = sequelize.define('Item', {
        title: DataTypes.STRING,
        quantity: DataTypes.STRING,
        measureUnit: DataTypes.STRING,
        packageType: DataTypes.STRING,
        deliveryBy: DataTypes.STRING,
        deliveryCost: DataTypes.STRING,
        paymentTerms: DataTypes.STRING,
        suggestedPrice: DataTypes.STRING,
        note: DataTypes.STRING,
        status: DataTypes.STRING,
        duration: DataTypes.INTEGER,
        hits: DataTypes.INTEGER,
        thumbnail: DataTypes.TEXT,
    }, {
        // Define Associations for Item table here.
        classMethods: {
            associate: function (models) {
                Item.belongsTo(models.User);
                Item.belongsTo(models.Commodity);
                Item.belongsTo(models.WareHouse);
                Item.hasMany(models.ItemImage);
                Item.hasMany(models.Bidding);
                Item.hasMany(models.ItemComment);
            }
        }
    });
    return Item;
};