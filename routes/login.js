let express = require('express');
let router = express.Router();
let passport = require('passport');

/* GET login */
router.get('/', function (req, res, next) {
    res.render('login');
});

/* POST request from login form */
router.post('/', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: 'login'
}));

module.exports = router;
