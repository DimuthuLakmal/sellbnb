/**
 * Created by kjtdi on 1/23/2017.
 */
/* Trading Commodity Model */
module.exports = function (sequelize, DataTypes) {
    var TradingCommodity = sequelize.define('TradingCommodity', {
        buyOrSell: DataTypes.INTEGER,
    }, {
        // Define Associations for Trading Commodity table here.
        classMethods: {
            associate: function (models) {
                TradingCommodity.belongsTo(models.User);
                TradingCommodity.belongsTo(models.Commodity);
            }
        }
    });
    return TradingCommodity;
};