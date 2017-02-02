var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET login */
router.get('/', function(req, res, next) {
    res.render('login');
});

module.exports = router;
