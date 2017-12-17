let express = require('express');
let router = express.Router();
let _ = require('lodash');
let models = require('./../models');
let sequelize = models.sequelize;
let passport = require('passport');
let passportLocal = require('passport-local');
let bcrypt = require('bcryptjs');
let salt = bcrypt.genSaltSync(10);
let fs = require('fs');
let path = require('path');

//local strategy use verifyCredentials
passport.use(new passportLocal.Strategy(verifyCredentials));

//it is not safe to use full user object to store in session. So only user id will be stored.
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

//Whenever needed we can use userid to extract other data of user.
passport.deserializeUser(function (id, done) {
  //retreive user object from db using userid
  let User = models.User;
  User.findAll({
    where: {
      id: id,
    }
  }).then(function (User) {
    let user = User[0].dataValues;
    done(null, user);
  });

});

//verffying username and password
function verifyCredentials(username, password, done) {
  sequelize.sync().then(
    function () {
      let User = models.User;

      User.findAll({
        where: {
          username: username,
          //password: bcrypt.compareSync(password, hash),
        }
      }).then(function (User) {
        if (!_.isUndefined(User[0])) {
          if (bcrypt.compareSync(password, User[0].dataValues.password)) {    //checking password
            let user = User[0].dataValues;
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
    res.render('login', {
        signupError:null,
        message: req.flash("error"),
        expectedUser : req.query.expUsr || '',
        loginOrRegister: 'Login',
        user: req.user,
    });
});

router.get('/login_seller', function (req, res, next) {
    delete req.session.notifications;
    delete req.session.messages;
    res.render('login_seller', {
        signupError:null,
        message: req.flash("error"),
        expectedUser : req.query.expUsr || '',
        loginOrRegister: 'Login',
        user: req.user,
    });
});


/* GET users listing. */
router.get('/logout', function (req, res, next) {
  req.logout();
  res.redirect('/');
});

router.get('/signup', function (req, res, next) {
  let signUpError = req.session.signupError;

  delete req.session.signupError;
  delete req.session.notifications;
  delete req.session.messages;
  res.render('login', {
    signupError: signUpError,
    message: req.flash("error"),
    notifications: notifications,
    messages: messages,
    commodityNames: commodityNames,
    loginOrRegister: 'Register',
    user: req.user,
  });
});

/* POST request from login form. User passport local method for authentication */
router.post('/login', function (req, res, next) {
  //redirect to previously visited page if login success, otherwise to login page.
  let redirectTo = req.session.returnTo || '/';
  passport.authenticate('local', {
    successRedirect: redirectTo,
    failureRedirect: 'login?action=login',
    failureFlash: true
  })(req, res, next);
});


/* Change password */
router.post('/password', function (req, res) {
  //retrieve data from req object
  let newpassword = req.body.newpassword;
  let currentpassword = req.body.currentpassword;
  let userId = req.body.id;

  //retrieve current password of userid and validate, then update password
  sequelize.sync().then(
    function () {
      let User = models.User;
      User.findAll({
        where: {
          id: userId,
          password: currentpassword,
        }
      }).then(function (User) {
        if (!_.isUndefined(User[0])) {
          let user = User[0].dataValues;
          let User = models.User;
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
  let newfullname = req.body.newfullname;
  let userId = req.body.id;

  //update fullname of user table
  sequelize.sync().then(
    function () {
      let User = models.User;
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
  let newcompanyname = req.body.newcompanyname;
  let userId = req.body.id;

  //update fullname of user table
  sequelize.sync().then(
    function () {
      let User = models.User;
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


/* Add Email Of user */
router.post('/emails/add', function (req, res) {
  //retrieve data from req object
  let newemail = req.body.newemail;
  let userId = req.body.id;

  //add new emails of user to emails table
  sequelize.sync().then(
    function () {
      let Email = models.Email;
      Email.create(
        {
          email: newemail,
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
router.post('/emails/delete', function (req, res) {
  //retrieve data from req object
  let emailId = req.body.emailId;

  //add new emails of user to emails table
  sequelize.sync().then(
    function () {
      let Email = models.Email;
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
  let newphone = req.body.newphone;
  let userId = req.body.id;

  //add new emails of user to emails table
  sequelize.sync().then(
    function () {
      let PhoneNumber = models.PhoneNumber;
      PhoneNumber.create(
        {
          number: newphone,
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
  let phoneId = req.body.phoneId;

  //add new emails of user to emails table
  sequelize.sync().then(
    function () {
      let PhoneNumber = models.PhoneNumber;
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
  let newwebsite = req.body.newwebsite;
  let userId = req.body.id;

  //update website of user table
  sequelize.sync().then(
    function () {
      let User = models.User;
      User.update(
        {website: newwebsite},
        {where: {id: userId}}
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
  let newaddress1 = req.body.newaddress1;
  let newaddress2 = req.body.newaddress2;
  let newcity = req.body.newcity;
  let userId = req.body.id;

  //update fullname of user table
  sequelize.sync().then(
    function () {
      let User = models.User;
      User.update(
        {
          mailingddress1: newaddress1,
          mailingddress2: newaddress2,
          mailingCity: newcity
        },
        {where: {id: userId}}
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
  let userId = req.body.userId;

  //write images to image files
  _.forEach(req.body.images, function (image, index) {
    let imageBuffer = decodeBase64Image(image.data); //decoding base64 images
    fs.writeFile('public/uploads/logo/' + image.filename, imageBuffer.data, function (err) {
      console.log(err);
    });
  });

  let imageURL = req.body.images[req.body.images.length - 1].filename;
  //add logo to user table
  sequelize.sync().then(
    function () {
      let User = models.User;
      User.update(
        {logo: imageURL},
        {where: {id: userId}}
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

/* Add User Profile Picture Of user */
router.post('/profile_pic', function (req, res) {
  //retrieve data from req object
  let userId = req.body.userId;

  //write images to image files
  _.forEach(req.body.images, function (image, index) {
    let imageBuffer = decodeBase64Image(image.data); //decoding base64 images
    fs.writeFile('public/uploads/profile_pic/' + image.filename, imageBuffer.data, function (err) {
      console.log(err);
    });
  });

  let imageURL = req.body.images[req.body.images.length - 1].filename;
  //add profile_pic to user table
  sequelize.sync().then(
    function () {
      let User = models.User;
      User.update(
        {profile_pic: imageURL},
        {where: {id: userId}}
      ).then(function (results) {
        res.redirect('/user/basic');
      }).catch(function (error) {
        req.session.errorMessage = 'Invalid Image.';
        res.redirect('/user/basic');
      });
    }
  ).catch(function (error) {
    console.log(error);
  });
});

/* Add Business Images Of user */
router.post('/businessImages', function (req, res) {
  //retrieve data from req object
  let userId = req.body.userId;

  //write images to image files
  _.forEach(req.body.images, function (image, index) {
    let imageBuffer = decodeBase64Image(image.data); //decoding base64 images
    fs.writeFile('public/uploads/businessImages/' + image.filename, imageBuffer.data, function (err) {
      console.log(err);
    });
  });

  let imageURL = req.body.images[req.body.images.length - 1].filename;
  //add logo to user table
  sequelize.sync().then(
    function () {
      let User = models.User;
      User.findAll({where: {id: userId}}).then(function (users) {
        let bi = [];
        if (users[0].business_images !== null && users[0].business_images !== '') {
          bi = JSON.parse(users[0].business_images);
        }
        bi.push(imageURL);
        User.update(
          {business_images: JSON.stringify(bi)},
          {where: {id: userId}}
        ).then(function (results) {
          res.redirect('/user/business');
        }).catch(function (error) {
          req.session.errorMessage = 'Invalid Image.';
          res.redirect('/user/business');
        });
      });
    }
  ).catch(function (error) {
    console.log(error);
  });
});


/* Change Company Introduction */
router.post('/companyIntroduction', function (req, res) {
  //retrieve data from req object
  let newCompanyIntroduction = req.body.newCompanyIntroduction;
  let userId = req.body.id;

  //update website of user table
  sequelize.sync().then(
    function () {
      let User = models.User;
      User.update(
        {companyIntroduction: newCompanyIntroduction},
        {where: {id: userId}}
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
  let newwarehouseaddress1 = req.body.newwarehouseaddress1;
  let newwarehouseaddress2 = req.body.newwarehouseaddress2;
  let warehouseCity = req.body.newwarehousecity;
  let userId = req.body.id;

  //add new emails of user to emails table
  sequelize.sync().then(
    function () {
      let WareHouse = models.WareHouse;
      WareHouse.create(
        {
          warehouseAddress1: newwarehouseaddress1,
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
  let tradingcommodity = req.body.tradingcommodity;
  let userId = req.body.id;
  let type = req.body.type;

  //add new emails of user to emails table
  sequelize.sync().then(
    function () {
      let TradingCommodity = models.TradingCommodity;
      let Commodity = models.Commodity;
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
  let tradingCommodityId = req.body.tradingCommodityId;

  //remove warehouse from warehouse table
  sequelize.sync().then(
    function () {
      let TradingCommodity = models.TradingCommodity;
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
  let warehouseId = req.body.warehouseId;

  //remove warehouse from warehouse table
  sequelize.sync().then(
    function () {
      let WareHouse = models.WareHouse;
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
  let userId = req.params.userId;
  //get warehouses details of user
  sequelize.sync().then(
    function () {
      let User = models.User;
      let WareHouse = models.WareHouse;
      User.findAll({
        where: {id: userId},
        include: [WareHouse],
      }).then(function (User) {
        let user = User[0].dataValues;
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
  let newcertificatename = req.body.newcertificatename;
  let newcertificatenumber = req.body.newcertificatenumber;
  let userId = req.body.id;

  //add new emails of user to emails table
  sequelize.sync().then(
    function () {
      let BusinessCertificate = models.BusinessCertificate;
      BusinessCertificate.create(
        {
          number: newcertificatenumber,
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
  let certificateId = req.body.certificateId;

  //remove payment information from payment table
  sequelize.sync().then(
    function () {
      let BusinessCertificate = models.BusinessCertificate;
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
  let newbankaccountno = req.body.newbankaccountno;
  let newbankaccounttype = req.body.newbankaccounttype;
  let newbankaccountname = req.body.newbankaccountname;
  let newbankname = req.body.newbankname;
  let newbankbranch = req.body.newbankbranch;
  let newbankcountry = req.body.newbankcountry;
  let userId = req.body.id;

  //add new payment information of user to PaymentInformation table
  sequelize.sync().then(
    function () {
      let PaymentInformation = models.PaymentInformation;
      PaymentInformation.create(
        {
          bankAccountNo: newbankaccountno,
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
  let paymentId = req.body.paymentId;

  //remove payment information from payment table
  sequelize.sync().then(
    function () {
      let PaymentInformation = models.PaymentInformation;
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
  let itemId = req.params.itemId;
  getWareHouses(req, res, '/items/id/' + itemId)
});

/* Get Warehouses for viewbiddingdetailsseller page*/
router.get('/sell/warehouses/userId/:userId/itemId/:itemId', function (req, res) {
  let itemId = req.params.itemId;
  getWareHouses(req, res, '/user/sell/bids/start/0?itemId=' + itemId);
});

router.post('/adduser', function (req, res) {
  if (typeof(req.body.username) !== "undefined" && req.body.username !== '' &&
    typeof(req.body.password) !== "undefined"&& req.body.password !== '' &&
    typeof(req.body.full_name) !== "undefined"&& req.body.full_name !== '' &&
    typeof(req.body.telephone) !== "undefined"&& req.body.telephone !== '' &&
    typeof(req.body.email) !== "undefined" && req.body.email !=='' ) {
    models.User.findAll({
      where: {
        username: req.body.username,
      }
    }).then(function (User) {
      if (!_.isUndefined(User[0])) {
        req.session.signupError = 'Your username exists already. Please try again';
        res.redirect('/user/signup?action=signup');
      } else {
        models.Email.findAll({
          where: {
            email: req.body.email,
          }
        }).then(function (Emails) {
          if (!_.isUndefined(Emails[0])) {
            req.session.signupError = 'Your emails exists already. Please try again';
            res.redirect('/user/signup?action=signup');
          } else {
            //set error message to flash
            //done(null, false, { message: 'Wrong username or password!' } );
            let hash = bcrypt.hashSync(req.body.password[0], salt);
            models.User.create(
              {
                username: req.body.username,
                password: hash,
                full_name: req.body.full_name,
                company_name: req.body.company_name,
                status: 0,
                rate_quality: 0,
                rate_delivery: 0,
                rate_reliablity_seller: 0,
                payment: 0,
                efficiency: 0,
                rate_reliablity_buyer: 0,
                no_of_ratings_quality: 0,
                no_of_ratings_delivery: 0,
                no_of_ratings_reliablity_seller: 0,
                no_of_ratings_payment: 0,
                no_of_ratings_efficiency: 0,
                no_of_ratings_reliablity_buyer: 0
              }
            ).then(function (createUser) {
              models.Email.create(
                {
                  email: req.body.email,
                  UserId: createUser.id
                }
              ).then(function () {
                models.PhoneNumber.create({
                  number: req.body.telephone,
                  UserId: createUser.id
                }).then(function () {

                  require('./email-controller').sendEmail({
                    template: 'new-user',
                    subject: 'Welcome to Ant Commodity!',
                    to: req.body.email
                  }, {
                    firstName: req.body.full_name
                  });

                  return res.redirect('/user/basic');
                });
              });
            });
          }
        });
      }
    });

  } else {
    req.session.signupError = 'error in adding user. missing required fields. Please try again';
    res.redirect('/user/signup?action=signup');
  }

});


// add seller
router.post('/addseller', function (req, res) {
  if (typeof(req.body.username) != "undefined" && typeof(req.body.password) != "undefined" && typeof(req.body.email) != "undefined") {
    models.User.findAll({
      where: {
        username: req.body.username,
      }
    }).then(function (User) {
      if (!_.isUndefined(User[0])) {
        req.session.signupError = 'Your username exists already. Please try again';
        res.redirect('/user/signup?action=signup');
      } else {
        //set error message to flash
        //done(null, false, { message: 'Wrong username or password!' } );
        let hash = bcrypt.hashSync(req.body.password[0], salt);
        models.User.create(
          {
            username: req.body.username,
            password: hash,
            status: 0,
            rate_quality: 0,
            rate_delivery: 0,
            rate_reliablity_seller: 0,
            payment: 0,
            efficiency: 0,
            rate_reliablity_buyer: 0,
            no_of_ratings_quality: 0,
            no_of_ratings_delivery: 0,
            no_of_ratings_reliablity_seller: 0,
            no_of_ratings_payment: 0,
            no_of_ratings_efficiency: 0,
            no_of_ratings_reliablity_buyer: 0,
            is_seller: true,
          }
        ).then(function (createUser) {
          models.Email.create(
            {
              email: req.body.email,
              UserId: createUser.id,
            }
          ).then(function () {
            res.redirect('/user/basic');
          });
          res.redirect('/user/basic');
        });

      }
    });

  } else {
    res.send("error in adding user!").status(err.status || 500).render('error', {
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
      let Email = models.Email;
      let PhoneNumber = models.PhoneNumber;
      let WareHouse = models.WareHouse;
      let User = models.User;
      User.findAll({
        where: {id: req.params.userId},
        include: [Email, PhoneNumber, WareHouse],
      }).then(function (Users) {
        //saving contact informations to sessions
        let user = Users[0];
        // console.log(Users);
        req.session.userContactInformation = user;
        res.redirect(req.session.redirectContactInforPath);
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
      let TradingCommodity = models.TradingCommodity;
      let Commodity = models.Commodity;
      let User = models.User;
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
      let PaymentInformation = models.PaymentInformation;
      let User = models.User;
      User.findAll({
        where: {id: req.params.userId},
        include: [PaymentInformation],
      }).then(function (Users) {
        //saving contact informations to sessions
        let user = Users[0];
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
      let BusinessCertificate = models.BusinessCertificate;
      let User = models.User;
      User.findAll({
        where: {id: req.params.userId},
        include: [BusinessCertificate],
      }).then(function (Users) {
        //saving contact informations to sessions
        let user = Users[0];
        console.log(user);
        req.session.userCertificateInformation = user.dataValues.BusinessCertificates;
        res.redirect('/user/business');
      });
    }
  );
});


/* Retrieve User Information to show public*/
/* Usage: userprofile page*/
router.get('/public/userId/:userId', function (req, res) {
  //retrieve data from req object
  sequelize.sync().then(
    function () {
      let User = models.User;
      let UserComment = models.UserComment;
      let Item = models.Item;
      let ItemImage = models.ItemImage;
      let Commodity = models.Commodity;
      User.findAll({
        where: {id: req.params.userId}
      }).then(function (Users) {
        //saving informations to sessions
        let user = Users[0];

        UserComment.findAll({
          where: {receivedUserIdFk: req.params.userId},
          include: [{
            model: User,
            as: 'feedbackUserId'
          }]
        }).then(function (UserComments) {
          Item.findAll({
            where: {
              UserId: req.params.userId,
              status: 'pending'
            },
            include: [ItemImage, Commodity]
          }).then(function (Items) {
            req.session.userPublicInformation = user;
            req.session.userPublicComments = UserComments;
            req.session.userPublicCurrentListing = Items;
            res.redirect('/user/public/userId/' + req.params.userId);
          });
        });

      });
    }
  );
});

/* Retrieve User Information to show in item page*/
/* Usage: bidpage page*/
router.get('/userFeedback/id/:id/itemId/:itemId', function (req, res) {
  //retrieve data from req object
  sequelize.sync().then(
    function () {
      let User = models.User;
      let UserComment = models.UserComment;
      UserComment.findAll({
        where: {receivedUserIdFk: req.params.id},
        include: [{
          model: User,
          as: 'feedbackUserId'
        }]
      }).then(function (UserComments) {
        req.session.bidpageUserFeedback = UserComments;
        res.redirect('/items/name/' + req.params.itemId)
      });
    }
  );
});

/* Add feedback to database. */
/* Usage: userprofile.ejs page */
router.post('/feedback', function (req, res) {
  //retrieve data from req object
  let userId = req.body.id;
  let rate_quality = req.body.rating_quality;
  let rate_delivery = req.body.rating_delivery;
  let rate_reliability_seller = req.body.rating_reliability_seller;
  let rate_payment = req.body.rating_payment;
  let rate_efficiency = req.body.rating_efficiency;
  let rate_reliability_buyer = req.body.rating_reliability_buyer;
  let feedback = req.body.feedback;
  let feedbackUserId = req.body.userId;

  let rate_quality_new = rate_quality;
  let rate_delivery_new = rate_delivery;
  let rate_reliability_seller_new = rate_reliability_seller;
  let rate_payment_new = rate_payment;
  let rate_efficiency_new = rate_efficiency;
  let rate_reliability_buyer_new = rate_reliability_buyer;

  let no_of_rate_quality_new = rate_quality == 0 ? 0 : 1;
  let no_of_rate_delivery_new = rate_delivery == 0 ? 0 : 1;
  let no_of_rate_reliability_seller_new = rate_reliability_seller == 0 ? 0 : 1;
  let no_of_rate_payment_new = rate_payment == 0 ? 0 : 1;
  let no_of_rate_efficiency_new = rate_efficiency == 0 ? 0 : 1;
  let no_of_rate_reliability_buyer_new = rate_reliability_buyer == 0 ? 0 : 1;

  //store news in database
  sequelize.sync().then(
    function () {
      let UserComment = models.UserComment;
      let User = models.User;
      UserComment.create({
        comment: feedback,
        rate_quality: rate_quality,
        rate_delivery: rate_delivery,
        rate_reliablity_seller: rate_reliability_seller,
        payment: rate_payment,
        efficiency: rate_efficiency,
        rate_reliablity_buyer: rate_reliability_buyer,
        receivedUserIdFk: userId,
        feedbackUserIdFk: feedbackUserId,
      }).then(function (insertedComment) {
        User.findAll({
          where: {id: userId},
        }).then(function (Users) {
          //saving informations to sessions
          let user = Users[0].dataValues;

          let rate_quality_old = user.rate_quality;
          let rate_delivery_old = user.rate_delivery;
          let rate_reliability_buyer_old = user.rate_reliablity_buyer;
          let rate_payment_old = user.payment;
          let rate_efficiency_old = user.efficiency;
          let rate_reliablity_seller_old = user.rate_reliablity_seller;
          let no_of_ratings_quality_old = user.no_of_ratings_quality;
          let no_of_ratings_delivery_old = user.no_of_ratings_delivery;
          let no_of_ratings_reliablity_seller_old = user.no_of_ratings_reliablity_seller;
          let no_of_ratings_payment_old = user.no_of_ratings_payment;
          let no_of_ratings_efficiency_old = user.no_of_ratings_efficiency;
          let no_of_ratings_reliablity_buyer_old = user.no_of_ratings_reliablity_buyer;


          if (no_of_ratings_quality_old > 0 && no_of_ratings_quality_old != null) {
            let sum = ((rate_quality_old * no_of_ratings_quality_old) + parseInt(rate_quality));
            rate_quality_new = (sum) / (parseInt(no_of_ratings_quality_old) + 1);
          }

          if (no_of_ratings_delivery_old > 0 && no_of_ratings_delivery_old != null) {
            rate_delivery_new = (rate_delivery_old * no_of_ratings_delivery_old + parseInt(rate_delivery)) / (no_of_ratings_delivery_old + 1);
          }

          if (no_of_ratings_reliablity_seller_old > 0 && no_of_ratings_reliablity_seller_old != null) {
            rate_reliability_seller_new = (rate_reliablity_seller_old * no_of_ratings_reliablity_seller_old + parseInt(rate_reliability_seller)) / (no_of_ratings_reliablity_seller_old + 1);
          }

          if (no_of_ratings_payment_old > 0 && no_of_ratings_payment_old != null) {
            rate_payment_new = (rate_payment_old * no_of_ratings_payment_old + parseInt(rate_payment)) / (no_of_ratings_payment_old + 1);
          }

          if (no_of_ratings_efficiency_old > 0 && no_of_ratings_efficiency_old != null) {
            rate_efficiency_new = (rate_efficiency_old * no_of_ratings_efficiency_old + parseInt(rate_efficiency)) / (no_of_ratings_efficiency_old + 1);
          }

          if (no_of_ratings_reliablity_buyer_old > 0 && no_of_ratings_reliablity_buyer_old != null) {
            rate_reliability_buyer_new = (rate_reliability_buyer_old * no_of_ratings_reliablity_buyer_old + parseInt(rate_reliability_buyer)) / (no_of_ratings_reliablity_buyer_old + 1);
          }

          User.update({
              rate_quality: rate_quality_new,
              rate_delivery: rate_delivery_new,
              rate_reliablity_seller: rate_reliability_seller_new,
              payment: rate_payment_new,
              efficiency: rate_efficiency_new,
              rate_reliablity_buyer: rate_reliability_buyer_new,
              no_of_ratings_quality: (no_of_ratings_quality_old + no_of_rate_quality_new),
              no_of_ratings_delivery: (no_of_ratings_delivery_old + no_of_rate_delivery_new),
              no_of_ratings_reliablity_seller: (no_of_ratings_reliablity_seller_old + no_of_rate_reliability_seller_new),
              no_of_ratings_payment: (no_of_ratings_payment_old + no_of_rate_payment_new),
              no_of_ratings_efficiency: (no_of_ratings_efficiency_old + no_of_rate_efficiency_new),
              no_of_ratings_reliablity_buyer: (no_of_ratings_reliablity_buyer_old + no_of_rate_reliability_buyer_new),
            },
            {where: {id: userId}}
          ).then(function (results) {
            res.redirect('/user/public/userId/' + userId);
          });
        });
      });
    }
  ).catch(function (error) {
    console.log(error);
  });
});

/* GET users listing. */
router.get('/forgotpassword_code', function (req, res, next) {

  let email = req.query['email'];

  sequelize.sync().then(
    function () {
      let User = models.User;
      let Email = models.Email;
      Email.findAll({
        where: {
          email: email,
        },
      }).then(function (Email) {
        if (!_.isUndefined(Email[0])) {
          //let emails = Email[0].dataValues;
          let random_numeber = Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000;

          require('./email-controller').sendEmail({
            template: 'forgot-password',
            to: email,
            subject: '[AntCommodity] Password Recovery',
          }, {
            randomNumber: random_numeber,
          })
        } else {
          req.session.recoveryEmailError = 'Invalid Email Address';
          res.redirect('/user/forgotpassword');
        }
      });
    }
  ).catch(function (error) {
    console.log(error);
  });
});

/* GET users listing. */
router.get('/forgotpassword_code_check', function (req, res, next) {

  let code = req.query['code'];

  if (code == req.session.recoveryCode) {
    res.redirect('/user/resetpassword');
  } else {
    req.session.codeError = 'Code is invalid';
    res.redirect('/user/forgotpassword/entercode');
  }


});

/* Change password */
router.post('/forgotpassword/update', function (req, res) {
  //retrieve data from req object
  let newpassword = req.body.password;
  let currentpassword = req.body.repassword;
  let email = req.session.recoveryEmail;

  let hash = bcrypt.hashSync(newpassword, salt);

  //retrieve current password of userid and validate, then update password
  sequelize.sync().then(
    function () {
      let User = models.User;
      let Email = models.Email;
      Email.findAll({
        where: {
          email: email,
        },
      }).then(function (Email) {
        if (!_.isUndefined(Email[0])) {
          let userId = Email[0].dataValues.UserId;
          User.update(
            {password: hash},
            {where: {id: userId}}
          ).then(function (results) {
            delete req.session.recoveryEmail;
            delete req.session.recoveryCode;
            delete req.session.codeError;
            res.redirect('/user/login?action=login');
          });
        }
      });
    }
  ).catch(function (error) {
    console.log(error);
  });
});

/* Retrieve best sellers from database */
/* Usage: Home Page Page */
router.get('/bestsellers', function (req, res) {
  sequelize.sync().then(
    function () {
      sequelize.query("SELECT id, profile_pic, logo, full_name, username, company_name, ((rate_quality+rate_delivery+rate_reliablity_seller+payment+efficiency+rate_reliablity_buyer)/6.0) as rating FROM Users Order by rating DESC limit 3", {type: sequelize.QueryTypes.SELECT})
        .then(function (users) {
          req.session.bestsellers = users;
          //res.jsonp(users);
          res.redirect('/')
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
  let userId = req.params.userId;
  let itemId = req.params.itemId;
  //get warehouses details of user
  sequelize.sync().then(
    function () {
      let User = models.User;
      let WareHouse = models.WareHouse;
      User.findAll({
        where: {id: userId},
        include: [WareHouse],
      }).then(function (User) {
        let user = User[0].dataValues;
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
  let matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

module.exports = router;
