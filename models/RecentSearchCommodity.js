/**
 * Created by kjtdi on 5/26/2017.
 */

/* Recent Item Search Model */
module.exports = function (sequelize, DataTypes) {
    var RecentSearchCommodity = sequelize.define('RecentSearchCommodity',{},
        {
          charset: 'utf8',
          collate: 'utf8_unicode_ci',
          // Define Associations for Recent Search Commodity table here.
            classMethods: {
                associate: function (models) {
                    RecentSearchCommodity.belongsTo(models.Commodity);
                    RecentSearchCommodity.belongsTo(models.Item);
                }
            }
        }
    );

    return RecentSearchCommodity;
};
