/**
 * Created by kjtdi on 1/23/2017.
 */
/* Recent Commodity Search Model */
module.exports = function (sequelize, DataTypes) {
    var RecentSearch = sequelize.define('RecentSearch', {
        commodity: DataTypes.STRING,
    }, {
      charset: 'utf8',
      collate: 'utf8_unicode_ci'
    });
    return RecentSearch;
};