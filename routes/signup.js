var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET login */
router.get('/', function(req, res, next) {
    res.render('login');
});

router.post('/',function (req,res) {
   res.send("ok");
});

module.exports = router;
