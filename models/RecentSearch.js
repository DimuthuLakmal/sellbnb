/**
 * Created by kjtdi on 1/23/2017.
 */
/* Phone Number Model */
module.exports = function (sequelize, DataTypes) {
    var RecentSearch = sequelize.define('RecentSearch', {
        commodity: DataTypes.STRING,
    });
    return RecentSearch;
};