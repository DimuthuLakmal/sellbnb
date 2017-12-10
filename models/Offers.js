/**
 * Created by malaka on 11/19/17.
 */

module.exports = function (sequelize, DataTypes) {
  var Offer = sequelize.define('Offer', {
    offerPrice : DataTypes.STRING,
    quantity: DataTypes.STRING,
    destinationPort: DataTypes.STRING,
    incoterms : DataTypes.STRING,
    medium: DataTypes.STRING,
    note: DataTypes.STRING,
  }, {
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
    classMethods: {
      associate: function (models) {
        Offer.belongsTo(models.Item);
        Offer.belongsTo(models.Commodity);
        Offer.belongsTo(models.User);
      }
    }
  });
  return Offer;
};