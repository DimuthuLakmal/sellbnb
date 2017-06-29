/* Index.js used for retreive all Models to one file */
var Sequelize = require('sequelize');
var mysql = require('mysql');
var fs = require('fs');
var path = require('path');

// var sequelize = new Sequelize('heroku_b49e2e6a6b341c4', 'b2f77e7393c63c', '9a0a721c', {
//     host: 'us-cdbr-iron-east-04.cleardb.net',
//     dialect: 'mysql',
//     pool: {
//         max: 5,
//         min: 0,
//         idle: 10000,
//     }
// });

var sequelize = new Sequelize('seller_bnb', 'root', '0773432552ijse4Ever!', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
    }
});

var db = {};
fs.readdirSync(__dirname).filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
}).forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
});


Object.keys(db).forEach(function(modelName) {
    if ('associate' in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;