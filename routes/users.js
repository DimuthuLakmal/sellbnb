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
    if (req.body.rememberme) {
        res.cookie('session', null);
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
                    //password: currentpassword,
                }
            }).then(function (User) {
                if (!_.isUndefined(User[0])) {
                    if (bcrypt.compareSync(currentpassword, User[0].dataValues.password)) {    //checking password
                        var user = User[0].dataValues;
                        var User = models.User;
                        var hash = bcrypt.hashSync(newpassword, salt);
                        User.update(
                            {password: hash},
                            {where: {id: userId}}
                        ).then(function (results) {
                            res.redirect('/user/basic');
                        });
                    } else {
                        req.session.errorMessage = 'User ID is invalid.';
                        res.redirect('/user/basic');
                    }
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

/* Change FullName */
router.post('/fullname', function (req, res) {
    //retrieve data from req object
    var newfullname = req.body.newfullname;
    var userId = req.body.id;

    //update fullname of user table
    sequelize.sync().then(
        function () {
            var User = models.User;
            User.update(
                {full_name: newfullname},
                {where: {id: userId}}
            ).then(function (results) {
                res.redirect('/user/basic');
            }).catch(function (error) {
                req.session.errorMessage = 'Invalid Full Name.';
                res.redirect('/user/basic');
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});

/* Change Company Name */
router.post('/companyname', function (req, res) {
    //retrieve data from req object
    var newcompanyname = req.body.newcompanyname;
    var userId = req.body.id;

    //update fullname of user table
    sequelize.sync().then(
        function () {
            var User = models.User;
            User.update(
                {company_name: newcompanyname},
                {where: {id: userId}}
            ).then(function (results) {
                res.redirect('/user/basic');
            }).catch(function (error) {
                req.session.errorMessage = 'Invalid Company Name';
                res.redirect('/user/basic');
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});

/* Change Location */
router.post('/location', function (req, res) {
    //retrieve data from req object
    var newaddress1 = req.body.newaddress1;
    var newaddress2 = req.body.newaddress2;
    var newcity = req.body.newcity;
    var userId = req.body.id;

    //update fullname of user table
    sequelize.sync().then(
        function () {
            var User = models.User;
            User.update(
                {
                    mailingddress1: newaddress1,
                    mailingddress2: newaddress2,
                    mailingCity: newcity
                },
                {where: {id: userId}}
            ).then(function (results) {
                res.redirect('/user/basic');
            }).catch(function (error) {
                req.session.errorMessage = 'Invalid Location.';
                res.redirect('/user/basic');
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});

/* Get Warehouses */
router.get('/view/warehouses/userId/:userId', function (req, res) {
    //retrieve data from req object
    var userId = req.params.userId;
    //get warehouses details of user
    sequelize.sync().then(
        function () {
            var User = models.User;
            var WareHouse = models.WareHouse;
            User.findAll({
                where: {id: userId},
                include: [WareHouse],
            }).then(function (User) {
                var user = User[0].dataValues;
                req.session.warehouses = user.WareHouses;
                res.redirect('/items/add');
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});


/* Get Warehouses for bidding page*/
router.get('/bidding/warehouses/userId/:userId/itemId/:itemId', function (req, res) {
    //retrieve data from req object
    var userId = req.params.userId;
    var itemId = req.params.itemId;
    //get warehouses details of user
    sequelize.sync().then(
        function () {
            var User = models.User;
            var WareHouse = models.WareHouse;
            User.findAll({
                where: {id: userId},
                include: [WareHouse],
            }).then(function (User) {
                var user = User[0].dataValues;
                req.session.bidwarehouses = user.WareHouses;
                res.redirect('/items/id/' + itemId);
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
                res.redirect('/user/adduser');
            } else {
                //set error message to flash
                //done(null, false, { message: 'Wrong username or password!' } );
                var hash = bcrypt.hashSync(req.body.password[0], salt);
                models.User.create({username: req.body.username, password: hash}).then(function () {
                    var redirectTo = req.session.returnTo || '/user/basic';
                    passport.authenticate('local', {
                        successRedirect: redirectTo,
                        failureRedirect: 'login',
                        failureFlash: true
                    })(req, res);
                    //res.redirect('/user/basic');
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

router.get('/logout', function (req, res) {
    req.session = null;
    res.redirect('/user/login');
});

router.get('/contactinfo', function (req, res) {
    res.render('useraccountcontactinformation');
});

router.get('/bankacc', function (req, res) {
    res.render('userpaymentinformation');
});

router.get('/bizinfo', function (req, res) {
    res.render('userbusinessinformation');
});

router.get('/notfpref', function (req, res) {
    res.render('usernotificationpreference');
});

/* Add Email*/
router.post('/addemail', function (req, res) {
    //retrieve data from req object
    var email = req.body.email;

    //update fullname of user table
    sequelize.sync().then(
        function () {
            /*
             var User = models.User;
             User.update(
             {full_name: newfullname},
             {where: {id: userId}}
             ).then(function (results) {
             res.redirect('/user/basic');
             }).catch(function (error) {
             req.session.errorMessage = 'Invalid Full Name.';
             res.redirect('/user/basic');
             });

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

             */
            models.Email.findAll({
                where: {
                    email: req.body.newemail
                }
            }).then(function (Email) {
                if (!_.isUndefined(Email[0])) {
                    res.send("email exists!");
                } else {
                    models.Email.create({email: req.body.newemail, UserId: req.user.id}).then(function () {
                        res.redirect('/user/contactinfo');
                    }).catch(function (error) {
                        res.send("error");
                    });
                }
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});

/* Add Phone No*/
router.post('/addphoneno', function (req, res) {
    //retrieve data from req object
    console.log(req);
    console.log(req.body);

    var phoneno = req.body.newphone;

    //update fullname of user table
    sequelize.sync().then(
        function () {
            models.PhoneNumber.findAll({
                where: {
                    number: phoneno
                }
            }).then(function (PhoneNumber) {
                if (!_.isUndefined(PhoneNumber[0])) {
                    res.send("phone number already exists!");
                } else {
                    models.PhoneNumber.create({number: phoneno, UserId: req.user.id}).then(function () {
                        res.redirect('/user/contactinfo');
                    }).catch(function (error) {
                        res.send("error");
                    });
                }
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});

/* Add Warehouse*/
router.post('/addwarehouse', function (req, res) {
    //retrieve data from req object
    console.log(req);
    console.log(req.body);


    //update fullname of user table
    sequelize.sync().then(
        function () {
            models.WareHouse.findAll({
                warehouseAddress1: req.body.newwarehouseaddress1,
                warehouseAddress2: req.body.newwarehouseaddress2
            }).then(function (WareHouse) {
                if (!_.isUndefined(WareHouse[0])) {
                    res.send("warehouse already exists!");
                } else {
                    models.WareHouse.create({
                        warehouseAddress1: req.body.newwarehouseaddress1,
                        warehouseAddress2: req.body.newwarehouseaddress2,
                        warehouseCity: req.body.newwarehousecity,
                        UserId: req.user.id
                    }).then(function () {
                        res.redirect('/user/contactinfo');
                    }).catch(function (error) {
                        res.send("error");
                    });
                }
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});

/* edit web site */
router.post('/editwebsite', function (req, res) {
    //retrieve data from req object
    console.log(req);
    console.log(req.body);

    models.User.update(
        {
        website:req.body.newwebsite
        },
        {where: {id: req.user.id}}
    ).catch(function (error) {
        req.session.errorMessage = 'Invalid Location.';
        //res.redirect('/user/basic');
    });
    res.redirect('/user/contactinfo');
});


/* edit mailing address */
router.post('/editmailingaddress', function (req, res) {
    //retrieve data from req object
    console.log(req);
    console.log(req.body);

    models.User.update(
        {
            mailingaddress1:req.body.newaddress1,
            mailingaddress2:req.body.newaddress2,
            mailingCity:req.body.newcity
        },
        {where: {id: req.user.id}}
    ).catch(function (error) {
        req.session.errorMessage = 'Invalid Location.';
        //res.redirect('/user/basic');
    });
    res.redirect('/user/contactinfo');
});

module.exports = router;
