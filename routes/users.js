var express = require('express');
var router = express.Router();
var _ = require('lodash');
var models = require('./../models');
var sequelize = models.sequelize;
var passport = require('passport');
var passportLocal = require('passport-local');
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
var fs = require('fs');
var path = require('path');

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
                    } else {
                        //set error message to flash
                        done(null, false, {message: 'Invalid Username or Password!'});
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

    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    if (commodityNames === null || commodityNames === undefined) {
        res.redirect('/api/commodity/names');
    }

    //populate notification
    var notifications = req.session.notifications;
    //check whether notification session is set.
    if(req.isAuthenticated()) {
        if (notifications === null || notifications === undefined) {
            res.redirect('/api/notification/userId/'+req.user.id);
        }
    }

    res.render('login', {message: req.flash("error"), commodityNames: commodityNames,
        notifications: notifications});
});

router.get('/signup', function (req, res, next) {
    res.render('login', {message: req.flash("error")});
});

/* POST request from login form. User passport local method for authentication */
router.post('/login', function (req, res, next) {
    //redirect to previously visited page if login success, otherwise to login page.
    var redirectTo = req.session.returnTo || '/';

    passport.authenticate('local', {
        successRedirect: redirectTo,
        failureRedirect: 'login',
        failureFlash: true
    })(req, res, next);
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
                { full_name: newfullname },
                { where: { id: userId } }
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
                { company_name: newcompanyname },
                { where: { id: userId } }
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


/* Add Email Of user */
router.post('/email/add', function (req, res) {
    //retrieve data from req object
    var newemail = req.body.newemail;
    var userId = req.body.id;

    //add new email of user to email table
    sequelize.sync().then(
        function () {
            var Email = models.Email;
            Email.create(
                { email: newemail,
                  UserId: userId,
                }
            ).then(function (insertedEmail) {
                res.redirect('/user/contact');
            }).catch(function (error) {
                req.session.errorMessage = 'Invalid Email';
                res.redirect('/user/contact');
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});

/* Delete Email Of user */
router.post('/email/delete', function (req, res) {
    //retrieve data from req object
    var emailId = req.body.emailId;

    //add new email of user to email table
    sequelize.sync().then(
        function () {
            var Email = models.Email;
            Email.destroy(
                {where: {id: emailId}}
            ).then(function (deletedEmail) {
                res.redirect('/user/contact');
            }).catch(function (error) {
                req.session.errorMessage = 'Couldn\'t delete Email';
                res.redirect('/user/contact');
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});

/* Add Phone Number Of user */
router.post('/phone/add', function (req, res) {
    //retrieve data from req object
    var newphone = req.body.newphone;
    var userId = req.body.id;

    //add new email of user to email table
    sequelize.sync().then(
        function () {
            var PhoneNumber = models.PhoneNumber;
            PhoneNumber.create(
                { number: newphone,
                  UserId: userId,
                }
            ).then(function (insertedPhone) {
                res.redirect('/user/contact');
            }).catch(function (error) {
                req.session.errorMessage = 'Invalid Phone Number';
                res.redirect('/user/contact');
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});

/* Delete Phone Number Of user */
router.post('/phone/delete', function (req, res) {
    //retrieve data from req object
    var phoneId = req.body.phoneId;

    //add new email of user to email table
    sequelize.sync().then(
        function () {
            var PhoneNumber = models.PhoneNumber;
            PhoneNumber.destroy(
                {where: {id: phoneId}}
            ).then(function (deletedPhoneNumber) {
                res.redirect('/user/contact');
            }).catch(function (error) {
                req.session.errorMessage = 'Couldn\'t delete phone number';
                res.redirect('/user/contact');
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});

/* Change Company Name */
router.post('/website', function (req, res) {
    //retrieve data from req object
    var newwebsite = req.body.newwebsite;
    var userId = req.body.id;

    //update website of user table
    sequelize.sync().then(
        function () {
            var User = models.User;
            User.update(
                { website: newwebsite },
                { where: { id: userId } }
            ).then(function (results) {
                res.redirect('/user/contact');
            }).catch(function (error) {
                req.session.errorMessage = 'Invalid Website';
                res.redirect('/user/contact');
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
                { mailingddress1: newaddress1 ,
                  mailingddress2: newaddress2 ,
                  mailingCity: newcity },
                { where: { id: userId } }
            ).then(function (results) {
                res.redirect('/user/contact');
            }).catch(function (error) {
                req.session.errorMessage = 'Invalid Address.';
                res.redirect('/user/contact');
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});

/* Add Company Logo Of user */
router.post('/logo', function (req, res) {
    //retrieve data from req object
    var userId = req.body.userId;

    console.log(req.body.images);

    //write images to image files
    _.forEach(req.body.images, function(image, index) {
        var imageBuffer = decodeBase64Image(image.data); //decoding base64 images
        fs.writeFile('../public/uploads/logo/'+image.filename, imageBuffer.data, function(err) {
            console.log(err);
        });
    });

    var imageURL = req.body.images[req.body.images.length-1].filename;
    console.log(imageURL);
    //add logo to user table
    sequelize.sync().then(
        function () {
            var User = models.User;
            User.update(
                { logo: imageURL },
                { where: { id: userId } }
            ).then(function (results) {
                res.redirect('/user/business');
            }).catch(function (error) {
                req.session.errorMessage = 'Invalid Image.';
                res.redirect('/user/business');
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});

/* Change Company Introduction */
router.post('/companyIntroduction', function (req, res) {
    //retrieve data from req object
    var newCompanyIntroduction = req.body.newCompanyIntroduction;
    var userId = req.body.id;

    //update website of user table
    sequelize.sync().then(
        function () {
            var User = models.User;
            User.update(
                { companyIntroduction: newCompanyIntroduction },
                { where: { id: userId } }
            ).then(function (results) {
                res.redirect('/user/business');
            }).catch(function (error) {
                req.session.errorMessage = 'Couldn\'t update company introduction';
                res.redirect('/user/business');
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});


/* Add Warehouse Of user */
router.post('/warehouse/add', function (req, res) {
    //retrieve data from req object
    var newwarehouseaddress1 = req.body.newwarehouseaddress1;
    var newwarehouseaddress2 = req.body.newwarehouseaddress2;
    var warehouseCity = req.body.newwarehousecity;
    var userId = req.body.id;

    //add new email of user to email table
    sequelize.sync().then(
        function () {
            var WareHouse = models.WareHouse;
            WareHouse.create(
                { warehouseAddress1: newwarehouseaddress1,
                  warehouseAddress2: newwarehouseaddress2,
                  warehouseCity: warehouseCity,
                  UserId: userId,
                }
            ).then(function (insertedWareHouse) {
                res.redirect('/user/contact');
            }).catch(function (error) {
                req.session.errorMessage = 'Invalid Warehouse Address';
                res.redirect('/user/contact');
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});

/* Add Trading Commidty Of user */
router.post('/tradingcommodity/add', function (req, res) {
    //retrieve data from req object
    var tradingcommodity = req.body.tradingcommodity;
    var userId = req.body.id;
    var type = req.body.type;

    //add new email of user to email table
    sequelize.sync().then(
        function () {
            var TradingCommodity = models.TradingCommodity;
            var Commodity = models.Commodity;
            Commodity.findAll({
                where: {name: tradingcommodity}
            }).then(function (Commodities) {
                TradingCommodity.create({
                    buyOrSell: type,
                    CommodityId: Commodities[0].dataValues.id,
                    UserId: userId,
                }).then(function (insertedWareHouse) {
                    res.redirect('/user/business');
                }).catch(function (error) {
                    req.session.errorMessage = 'Invalid Trading Commodity';
                    res.redirect('/user/business');
                });
            })
        }
    ).catch(function (error) {
        console.log(error);
    });
});

/* Delete Trading Commodity Of user */
router.post('/tradingcommodity/delete', function (req, res) {
    //retrieve data from req object
    var tradingCommodityId = req.body.tradingCommodityId;

    //remove warehouse from warehouse table
    sequelize.sync().then(
        function () {
            var TradingCommodity = models.TradingCommodity;
            TradingCommodity.destroy(
                {where: {id: tradingCommodityId}}
            ).then(function (deletedTradingCommodities) {
                res.redirect('/user/business');
            }).catch(function (error) {
                req.session.errorMessage = 'Couldn\'t delete Commodity';
                res.redirect('/user/business');
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});

/* Delete Warehouse Of user */
router.post('/warehouse/delete', function (req, res) {
    //retrieve data from req object
    var warehouseId = req.body.warehouseId;

    //remove warehouse from warehouse table
    sequelize.sync().then(
        function () {
            var WareHouse = models.WareHouse;
            WareHouse.destroy(
                {where: {id: warehouseId}}
            ).then(function (deletedWareHouse) {
                res.redirect('/user/contact');
            }).catch(function (error) {
                req.session.errorMessage = 'Couldn\'t delete warehouse';
                res.redirect('/user/contact');
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


/* Add Business Certificate Of user */
router.post('/certificate/add', function (req, res) {
    //retrieve data from req object
    var newcertificatename = req.body.newcertificatename;
    var newcertificatenumber = req.body.newcertificatenumber;
    var userId = req.body.id;

    //add new email of user to email table
    sequelize.sync().then(
        function () {
            var BusinessCertificate = models.BusinessCertificate;
            BusinessCertificate.create(
                { number: newcertificatenumber,
                    name: newcertificatename,
                    UserId: userId,
                }
            ).then(function (insertedCertificate) {
                res.redirect('/user/business');
            }).catch(function (error) {
                req.session.errorMessage = 'Invalid Certificate';
                res.redirect('/user/business');
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});

/* Delete Certificate Information Of user */
router.post('/certificate/delete', function (req, res) {
    //retrieve data from req object
    var certificateId = req.body.certificateId;

    //remove payment information from payment table
    sequelize.sync().then(
        function () {
            var BusinessCertificate = models.BusinessCertificate;
            BusinessCertificate.destroy(
                {where: {id: certificateId}}
            ).then(function (deletedCertificateInfromation) {
                res.redirect('/user/business');
            }).catch(function (error) {
                req.session.errorMessage = 'Couldn\'t delete Certificate Information';
                res.redirect('/user/business');
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});

/* Add Payment information Of user */
/* Usage: userpaymentinformationpage */
router.post('/paymentinfo/add', function (req, res) {
    //retrieve data from req object
    var newbankaccountno = req.body.newbankaccountno;
    var newbankaccounttype = req.body.newbankaccounttype;
    var newbankaccountname = req.body.newbankaccountname;
    var newbankname = req.body.newbankname;
    var newbankbranch = req.body.newbankbranch;
    var newbankcountry = req.body.newbankcountry;
    var userId = req.body.id;

    //add new payment information of user to PaymentInformation table
    sequelize.sync().then(
        function () {
            var PaymentInformation = models.PaymentInformation;
            PaymentInformation.create(
                { bankAccountNo: newbankaccountno,
                    accountType: newbankaccounttype,
                    accountName: newbankaccountname,
                    bankName: newbankname,
                    bankCountry: newbankcountry,
                    bankCBranch: newbankbranch,
                    UserId: userId,
                }
            ).then(function (insertedPaymentInformation) {
                res.redirect('/user/payment');
            }).catch(function (error) {
                req.session.errorMessage = 'Invalid Payment Informations';
                res.redirect('/user/payment');
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});


/* Delete Payment Information Of user */
router.post('/paymentinfo/delete', function (req, res) {
    //retrieve data from req object
    var paymentId = req.body.paymentId;

    //remove payment information from payment table
    sequelize.sync().then(
        function () {
            var PaymentInformation = models.PaymentInformation;
            PaymentInformation.destroy(
                {where: {id: paymentId}}
            ).then(function (deletedPaymentInfromation) {
                res.redirect('/user/payment');
            }).catch(function (error) {
                req.session.errorMessage = 'Couldn\'t delete Payment Information';
                res.redirect('/user/payment');
            });
        }
    ).catch(function (error) {
        console.log(error);
    });
});


/* Get Warehouses for bidding page*/
router.get('/bidding/warehouses/userId/:userId/itemId/:itemId', function (req, res) {
    var itemId = req.params.itemId;
    getWareHouses(req, res, '/items/id/'+itemId )
});

/* Get Warehouses for viewbiddingdetailsseller page*/
router.get('/sell/warehouses/userId/:userId/itemId/:itemId', function (req, res) {
    var itemId = req.params.itemId;
    getWareHouses(req, res, '/user/sell/bids/start/0?itemId='+itemId );
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

/* Retrieve User Contact Information*/
/* Usage: usercontactinformation page*/
router.get('/contactinfo/userId/:userId', function (req, res) {
    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var Email = models.Email;
            var PhoneNumber = models.PhoneNumber;
            var WareHouse = models.WareHouse;
            var User = models.User;
            User.findAll({
                where: {id: req.params.userId},
                include: [Email, PhoneNumber, WareHouse],
            }).then(function (Users) {
                //saving contact informations to sessions
                var user  = Users[0];
                console.log(Users);
                req.session.userContactInformation = user;
                res.redirect('/user/contact');
            });
        }
    );
});

/* Retrieve User Business Information*/
/* Usage: userbusinessinformation page*/
router.get('/businessinfo/userId/:userId', function (req, res) {
    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var TradingCommodity = models.TradingCommodity;
            var Commodity = models.Commodity;
            var User = models.User;
            TradingCommodity.findAll({
                where: {
                    '$User.id$': req.params.userId,
                },
                include: [User, Commodity],
            }).then(function (TradingCommodities) {
                //saving business informations to sessions
                req.session.userTradingBusinessInformation = TradingCommodities;
                res.redirect('/user/business');
            });
        }
    );
});

/* Retrieve User Payment Information*/
/* Usage: userpaymentinformation page*/
router.get('/paymentinfo/userId/:userId', function (req, res) {
    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var PaymentInformation = models.PaymentInformation;
            var User = models.User;
            User.findAll({
                where: {id: req.params.userId},
                include: [PaymentInformation],
            }).then(function (Users) {
                //saving contact informations to sessions
                var user  = Users[0];
                req.session.userPaymentInformation = user;
                res.redirect('/user/payment');
            });
        }
    );
});

/* Usage: userbusinessinformation page*/
router.get('/certificateinfo/userId/:userId', function (req, res) {
    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var BusinessCertificate = models.BusinessCertificate;
            var User = models.User;
            User.findAll({
                where: {id: req.params.userId},
                include: [BusinessCertificate],
            }).then(function (Users) {
                //saving contact informations to sessions
                var user  = Users[0];
                console.log(user);
                req.session.userCertificateInformation = user.dataValues.BusinessCertificates;
                res.redirect('/user/business');
            });
        }
    );
});

router.get('/delall', function () {
    models.User.destroy({
        where: {}
    }).then(function () {
        res.send("ok");
    });
});

function getWareHouses(req, res, url) {
    /* Get Warehouses for bidding page*/
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
                    res.redirect(url);
                });
            }
        ).catch(function (error) {
            console.log(error);
        });
}

//function to decode base64 image
function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}

module.exports = router;
