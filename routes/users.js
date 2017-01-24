var express = require('express');
var router = express.Router();
var _ = require('lodash');
var models = require('./../models');
var sequelize = models.sequelize;
var passport = require('passport');
var passportLocal   = require('passport-local');

//local strategy use verifyCredentials
passport.use(new passportLocal.Strategy(verifyCredentials));

//it is not safe to use full user object to store in session. So only user id will be stored.
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

//Whenever needed we can use userid to extract other data of user.
passport.deserializeUser(function(id, done) {
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
            password: password,
          }
        }).then(function (User) {
          if(!_.isUndefined(User[0])) {
            var user = User[0].dataValues;
            done(null, {id: user.id});
          } else {
            //set error message to flash
            done(null, false, { message: 'Invalid Username or Password!' } );
          }
        });
      }
  );
}

/* GET users listing. */
router.get('/login', function(req, res, next) {
  res.render('login', {message: req.flash("error")});
});

/* POST request from login form. User passport local method for authentication */
router.post('/login', function (req, res, next) {
    //redirect to previously visited page if login success, otherwise to login page.
    var redirectTo = req.session.returnTo || '/';
    delete req.session.returnTo;

    passport.authenticate('local', {
        successRedirect: redirectTo,
        failureRedirect: 'login',
        failureFlash: true
    })(req, res, next);
});

module.exports = router;
