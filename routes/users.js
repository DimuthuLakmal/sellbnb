var express = require('express');
var router = express.Router();
var _ = require('lodash');
var models = require('./../models');
var sequelize = models.sequelize;
var passport = require('passport');
var passportLocal = require('passport-local');
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);

//local strategy use verifyCredentials
passport.use(new passportLocal.Strategy(verifyCredentials));

//it is not safe to use full user object to store in session. So only user id will be stored.
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

//Whenever needed we can use userid to extract other data of user.
passport.deserializeUser(function (id, done) {
    //retreive user object from db using userid
    var User = models.User;
    User.findAll({
        where: {
            id: id,
        }
    }).then(function (User) {
        var user = User[0].dataValues;
        done(null, user);
    });

});

//verffying username and password
function verifyCredentials(username, password, done) {
    sequelize.sync().then(
        function () {
            var User = models.User;

            User.findAll({
                where: {
                    username: username,
                    //password: bcrypt.compareSync(password, hash),
                }
            }).then(function (User) {
                if (!_.isUndefined(User[0])) {
                    if (bcrypt.compareSync(password, User[0].dataValues.password)) {    //checking password
                        var user = User[0].dataValues;
                        done(null, {id: user.id});
                        console.log("login success!");
                    }
                } else {
                    //set error message to flash
                    done(null, false, {message: 'Invalid Username or Password!'});
                }
            });
        }
    );
}

/* GET users listing. */
router.get('/login', function (req, res, next) {
    console.error(req);
    res.render('login', {message: req.flash("error")});
});

router.get('/signup', function (req, res, next) {
    res.render('login', {message: req.flash("error")});
});

/* POST request from login form. User passport local method for authentication */
router.post('/login', function (req, res, next) {
    //console.error(req);

    if (req.body.rememberme) {
        //req.session = null;
    }
    //redirect to previously visited page if login success, otherwise to login page.
    var redirectTo = req.session.returnTo || '/user/basic';

    passport.authenticate('local', {
        successRedirect: redirectTo,
        failureRedirect: 'login',
        failureFlash: true
    })(req, res, next);
    if(req.body.rememberme){
        res.cookie('session',null);
        console.error("okay");
    }
});


/* Change password */
router.post('/password', function (req, res) {
    //retrieve data from req object
    var newpassword = req.body.newpassword;
    var currentpassword = req.body.currentpassword;
    var userId = req.body.id;

    //retrieve current password of userid and validate, then update password
    sequelize.sync().then(
        function () {
            var User = models.User;
            User.findAll({
                where: {
                    id: userId,
                    password: currentpassword,
                }
            }).then(function (User) {
                if (!_.isUndefined(User[0])) {
                    var user = User[0].dataValues;
                    var User = models.User;
                    User.update(
                        {password: newpassword},
                        {where: {id: userId}}
                    ).then(function (results) {
                        res.redirect('/user/basic');
                    });
                } else {
                    req.session.errorMessage = 'Current Password is invalid.';
                    res.redirect('/user/basic');
                }
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});

router.post('/adduser', function (req, res) {
    if (typeof(req.body.username) != "undefined" && typeof req.body.password != "undefined") {

        models.User.findAll({
            where: {
                username: req.body.username,
            }
        }).then(function (User) {
            if (!_.isUndefined(User[0])) {
                res.redirect('/signup');
            } else {
                //set error message to flash
                //done(null, false, { message: 'Wrong username or password!' } );
                var hash = bcrypt.hashSync(req.body.password[0], salt);
                models.User.create({username: req.body.username, password: hash}).then(function () {
                    res.redirect('/user/basic');
                });
            }
        });

    } else {
        res.send("error in adding user!");
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    }

});

router.get('/delall', function () {
    models.User.destroy({
        where: {}
    }).then(function () {
        res.send("ok");
    });
});

router.get('/logout',function(req,res){
    req.session = null;
    res.redirect('/user/login');
});

module.exports = router;
