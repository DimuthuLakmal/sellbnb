/**
 * Created by kjtdi on 1/23/2017.
 */
/* Item Image Model */
module.exports = function (sequelize, DataTypes) {
    var ItemImage = sequelize.define('ItemImage', {
        url: DataTypes.STRING,
    });
    return ItemImage;
};
