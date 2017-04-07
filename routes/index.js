var express = require('express');
var _ = require('lodash');
var router = express.Router();
var CommodityController = require('../controller/commodity');
var async = require('async');


//view home page
router.get('/', function(req, res) {
  removeSessionParameterSellingPage(req);
  removeSessionParameters(req);

  //retreieve required data from session
  var commodityPopular = req.session.commodityPopular;
  var commodityNames = req.session.commodityNames;
  var latestItems = req.session.latestItems;
  var notifications = req.session.notifications;
  var bestsellers = req.session.bestsellers;
  var toprated = req.session.toprated;
  var neartocloseItems = req.session.neartocloseItems;
  var latestNews = req.session.latestNews;

  //check whether commodityPopular session is set
  if (commodityPopular === null || commodityPopular === undefined) {
    res.redirect('/api/commodity/viewpopular');
  }

  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path;
  if (commodityNames === null || commodityNames === undefined) {
    res.redirect('/api/commodity/names');
  }

  //check whether best sellers session is set
  if (bestsellers === null || bestsellers === undefined) {
    res.redirect('/api/items/bestsellers');
  }

  //check whether top rated items session is set
  if (neartocloseItems === null || neartocloseItems === undefined) {
    res.redirect('/api/items/neartoclose');
  }

  //check whether Near to bidding close items session is set
  if (toprated === null || toprated === undefined) {
    res.redirect('/api/items/toprated');
  }

  //check whether latest news session is set
  if (latestNews === null || latestNews === undefined) {
    res.redirect('/api/news/viewlatest');
  }

  //check whether notification session is set.
  if(req.isAuthenticated()) {
    if (notifications === null || notifications === undefined) {
      res.redirect('/api/notification/userId/'+req.user.id);
    }
  }

  //check whether latest items session is set
  if (latestItems === null || latestItems === undefined) {
    res.redirect('/api/items/viewlatest');
  }

  delete req.session.returnTo;
  delete req.session.returnToCommodityName;
  delete req.session.commodityPopular;
  delete req.session.latestItems;
  delete req.session.latestItems;
  delete req.session.bestsellers;
  delete req.session.toprated;
  delete req.session.neartocloseItems;
  delete req.session.notifications;
  res.render('index', {
    notifications: notifications,
    commodityNames: commodityNames,
    latestItems: latestItems,
    commodityPopular: commodityPopular,
    notifications: notifications,
    bestsellers: bestsellers,
    toprated: toprated,
    neartocloseItems: neartocloseItems,
    latestNews: latestNews,
    user: req.user,
  });

});


/* GET add news page. */
router.get('/addnews', function(req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  // var notifications = req.session.notifications;
  // //check whether notification session is set.
  // if(req.isAuthenticated()) {
  //   if (notifications === null || notifications === undefined) {
  //     res.redirect('/api/notification/userId/'+req.user.id);
  //   }
  // }

  // //this will be needed to populate commodity names in top menu
  // var commodityNames = req.session.commodityNames
  // //check whether commodityNames session is set
  // if (commodityNames === null || commodityNames === undefined) {
  //   res.redirect('/api/commodity/names');
  // }

  res.render('addnews', {
    // commodityNames: commodityNames,
    // notifications: notifications,
  });
});

/* GET view first news page. */
router.get('/news', function(req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);
  var newsAll = req.session.newsall;
  var newsOffset = req.session.newsOffset;
  var newsCount = req.session.newsCount;
  var currentPageNumber = (parseInt(newsOffset)/3)+1;
  var maxPageCount = Math.floor(newsCount/3);
  //Note: check whether equation is correct. previous one is maxPageCount % 10 !== 0
  if(newsCount % 3 !== 0) {
    maxPageCount++;
  }
  var pageMultipationFactor = Math.floor((parseInt(newsOffset)/9));

  //check whether newsAll session is set
  if (newsAll === null || newsAll === undefined) {
    res.redirect('/api/news/viewall/start/0');
  }

  //this will be needed to populate commodity names in top menu
  var commodityNames = req.session.commodityNames
  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path;
  if (commodityNames === null || commodityNames === undefined) {
    res.redirect('/api/commodity/names');
  }

  var notifications = req.session.notifications;
  //check whether notification session is set.
  if(req.isAuthenticated()) {
    if (notifications === null || notifications === undefined) {
      res.redirect('/api/notification/userId/'+req.user.id);
    }
  }

  req.session.newsall = null;
  req.session.newsOffset = null;
  req.session.newsCount = null;
  delete req.session.returnToCommodityName;
  delete req.session.notifications;
  res.render('viewnewsall', {
    News: newsAll,
    currentPageNumber: currentPageNumber,
    maxPageCount: maxPageCount,
    pageMultipationFactor: pageMultipationFactor,
    commodityNames: commodityNames,
    notifications: notifications,
    user: req.user,
  });
});

/* GET view news page other than first page */
router.get('/news/start/:start', function(req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);
  var newsAll = req.session.newsall;
  var newsOffset = req.session.newsOffset;
  var newsCount = req.session.newsCount;
  var currentPageNumber = (parseInt(newsOffset)/3)+1;
  var maxPageCount = Math.floor(newsCount/3);
  //Note: check whether equation is correct. previous one is maxPageCount % 10 !== 0
  if(newsCount % 3 !== 0) {
    maxPageCount++;
  }
  var pageMultipationFactor = Math.floor((parseInt(newsOffset)/9));

  //check whether newsAll session is set
  if (newsAll === null || newsAll === undefined) {
    res.redirect('/api/news/viewall/start/'+req.params.start);
  }

  //this will be needed to populate commodity names in top menu
  var commodityNames = req.session.commodityNames
  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path;
  if (commodityNames === null || commodityNames === undefined) {
    res.redirect('/api/commodity/names');
  }

  var notifications = req.session.notifications;
  //check whether notification session is set.
  if(req.isAuthenticated()) {
    if (notifications === null || notifications === undefined) {
      res.redirect('/api/notification/userId/'+req.user.id);
    }
  }

  req.session.newsall = null;
  req.session.newsOffset = null;
  req.session.newsCount = null;
  delete req.session.returnToCommodityName;
  delete req.session.notifications;
  res.render('viewnewsall', {
    News: newsAll,
    currentPageNumber: currentPageNumber,
    maxPageCount: maxPageCount,
    pageMultipationFactor: pageMultipationFactor,
    commodityNames: commodityNames,
    notifications: notifications,
    user: req.user,
  });
});

/* GET view single news page*/
router.get('/news/id/:id', function(req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);
  var news = req.session.specificNews;

  //check whether newsAll session is set
  if (news === null || news === undefined) {
    res.redirect('/api/news/id/'+req.params.id);
  }

  //this will be needed to populate commodity names in top menu
  var commodityNames = req.session.commodityNames
  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path;
  if (commodityNames === null || commodityNames === undefined) {
    res.redirect('/api/commodity/names');
  }

  var notifications = req.session.notifications;
  //check whether notification session is set.
  if(req.isAuthenticated()) {
    if (notifications === null || notifications === undefined) {
      res.redirect('/api/notification/userId/'+req.user.id);
    }
  }

  req.session.specificNews = null;
  delete req.session.returnToCommodityName;
  delete req.session.notifications;
  res.render('viewnews', {
        News: news,
        commodityNames: commodityNames,
        notifications: notifications,
        user: req.user,
      });
});


//view basic details
router.get('/user/basic', function(req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  //check whether use logged or not
  var errorMessage = req.session.errorMessage || '';
  delete req.session.errorMessage;
  if(req.isAuthenticated()) {
    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    //check whether notification session is set.
    if(req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/'+req.user.id);
      }
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.notifications;
    res.render('useraccountbasics', {
      isAuthenticated : req.isAuthenticated(),
      user: req.user,
      errorMessage: errorMessage,
      commodityNames: commodityNames,
      notifications: notifications,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login');
  }
});


//view contact details
router.get('/user/contact', function(req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  //check whether use logged or not
  var errorMessage = req.session.errorMessage || '';

  if(req.isAuthenticated()) {
    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    //check whether notification session is set.
    if(req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/'+req.user.id);
      }
    }

    var userContactInformation = req.session.userContactInformation;
    //retreive user contact information
    if(req.isAuthenticated()) {
        req.session.redirectContactInforPath = req.path;
      if (userContactInformation === null || userContactInformation === undefined) {
        res.redirect('/api/user/contactinfo/userId/'+req.user.id);
      }
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.errorMessage;
    delete req.session.userContactInformation;
    delete req.session.notifications;
    delete req.session.redirectContactInforPath;
    res.render('useraccountcontactinformation', {
      isAuthenticated : req.isAuthenticated(),
      user: req.user,
      errorMessage: errorMessage,
      commodityNames: commodityNames,
      notifications: notifications,
      userContactInformation: userContactInformation,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login');
  }
});

//view user business details
router.get('/user/business', function(req, res) {
    removeSessionParameters(req);
    removeSessionParameterSellingPage(req);

    //check whether use logged or not
    var errorMessage = req.session.errorMessage || '';
    delete req.session.errorMessage;
    if(req.isAuthenticated()) {
        //this will be needed to populate commodity names in top menu
        var commodityNames = req.session.commodityNames
        //check whether commodityNames session is set
        req.session.returnToCommodityName = req.path;
        if (commodityNames === null || commodityNames === undefined) {
            res.redirect('/api/commodity/names');
        }

        var notifications = req.session.notifications;
        //check whether notification session is set.
        if(req.isAuthenticated()) {
          if (notifications === null || notifications === undefined) {
            res.redirect('/api/notification/userId/'+req.user.id);
          }
        }

        var userTradingBusinessInformation = req.session.userTradingBusinessInformation;
        //check whether notification session is set.
        if(req.isAuthenticated()) {
          if (userTradingBusinessInformation === null || userTradingBusinessInformation === undefined) {
            res.redirect('/api/user/businessinfo/userId/'+req.user.id);
          }
        }

        var userCertificateInformation = req.session.userCertificateInformation;
        //check whether notification session is set.
        if(req.isAuthenticated()) {
          if (userCertificateInformation === null || userCertificateInformation === undefined) {
            res.redirect('/api/user/certificateinfo/userId/'+req.user.id);
          }
        }

        delete req.session.returnTo;
        delete req.session.returnToCommodityName;
        delete req.session.userCertificateInformation;
        delete req.session.userTradingBusinessInformation;
        delete req.session.notifications;
        res.render('userbusinessinformation', {
            isAuthenticated : req.isAuthenticated(),
            user: req.user,
            errorMessage: errorMessage,
            commodityNames: commodityNames,
            notifications: notifications,
            userTradingBusinessInformation: userTradingBusinessInformation,
            userCertificateInformation: userCertificateInformation,
        });
    } else {
        //set visited path to session. It uses to rediect to again to that page when login success.
        req.session.returnTo = req.path;
        res.redirect('/user/login');
    }
});

//view user payment details
router.get('/user/payment', function(req, res) {
    removeSessionParameters(req);
    removeSessionParameterSellingPage(req);

    //check whether use logged or not
    var errorMessage = req.session.errorMessage || '';
    delete req.session.errorMessage;
    if(req.isAuthenticated()) {
        //this will be needed to populate commodity names in top menu
        var commodityNames = req.session.commodityNames
        //check whether commodityNames session is set
        req.session.returnToCommodityName = req.path;
        if (commodityNames === null || commodityNames === undefined) {
            res.redirect('/api/commodity/names');
        }

        var notifications = req.session.notifications;
        //check whether notification session is set.
        if(req.isAuthenticated()) {
          if (notifications === null || notifications === undefined) {
            res.redirect('/api/notification/userId/'+req.user.id);
          }
        }

        var userPaymentInformation = req.session.userPaymentInformation;
        //retreive user payment information
        if(req.isAuthenticated()) {
          if (userPaymentInformation === null || userPaymentInformation === undefined) {
            res.redirect('/api/user/paymentinfo/userId/'+req.user.id);
          }
        }

        delete req.session.returnTo;
        delete req.session.returnToCommodityName;
        delete req.session.userPaymentInformation;
        delete req.session.notifications;
        res.render('userpaymentinformation', {
            isAuthenticated : req.isAuthenticated(),
            user: req.user,
            errorMessage: errorMessage,
            commodityNames: commodityNames,
            notifications: notifications,
            userPaymentInformation: userPaymentInformation,
        });
    } else {
        //set visited path to session. It uses to rediect to again to that page when login success.
        req.session.returnTo = req.path;
        res.redirect('/user/login');
    }
});


//view user notification details
router.get('/user/notification', function(req, res) {
    removeSessionParameters(req);
    removeSessionParameterSellingPage(req);

    //check whether use logged or not
    var errorMessage = req.session.errorMessage || '';
    delete req.session.errorMessage;
    if(req.isAuthenticated()) {
        //this will be needed to populate commodity names in top menu
        var commodityNames = req.session.commodityNames
        //check whether commodityNames session is set
        req.session.returnToCommodityName = req.path;
        if (commodityNames === null || commodityNames === undefined) {
            res.redirect('/api/commodity/names');
        }

        var notifications = req.session.notifications;
        //check whether notification session is set.
        if(req.isAuthenticated()) {
          if (notifications === null || notifications === undefined) {
            res.redirect('/api/notification/userId/'+req.user.id);
          }
        }

        delete req.session.returnTo;
        delete req.session.returnToCommodityName;
        delete req.session.notifications;
        res.render('usernotificationpreference', {
            isAuthenticated : req.isAuthenticated(),
            user: req.user,
            errorMessage: errorMessage,
            commodityNames: commodityNames,
            notifications: notifications,
        });
    } else {
        //set visited path to session. It uses to rediect to again to that page when login success.
        req.session.returnTo = req.path;
        res.redirect('/user/login');
    }
});

//view user payment details
router.get('/user/public/userId/:userId', function(req, res) {
    removeSessionParameters(req);
    removeSessionParameterSellingPage(req);

    //check whether use logged or not
    var errorMessage = req.session.errorMessage || '';
    delete req.session.errorMessage;
    if(req.isAuthenticated()) {
        //this will be needed to populate commodity names in top menu
        var commodityNames = req.session.commodityNames
        //check whether commodityNames session is set
        req.session.returnToCommodityName = req.path;
        if (commodityNames === null || commodityNames === undefined) {
            res.redirect('/api/commodity/names');
        }

        var notifications = req.session.notifications;
        //check whether notification session is set.
        if(req.isAuthenticated()) {
            if (notifications === null || notifications === undefined) {
                res.redirect('/api/notification/userId/'+req.user.id);
            }
        }

        //retrieve user's public details
        var userPublicInformation = req.session.userPublicInformation;
        var userPublicComments = req.session.userPublicComments;
        var userPublicCurrentListing = req.session.userPublicCurrentListing;
        if (userPublicInformation === null || userPublicInformation === undefined) {
            res.redirect('/api/user/public/userId/'+req.params.userId);
        }


        var userContactInformation = req.session.userContactInformation;
        //retreive user contact information
        if(req.isAuthenticated()) {
            req.session.redirectContactInforPath = req.path;
            if (userContactInformation === null || userContactInformation === undefined) {
                res.redirect('/api/user/contactinfo/userId/'+req.user.id);
            }
        }

        var biddingCountUserProfile = req.session.biddingCountUserProfile;
        //retreive user contact information
        if(req.isAuthenticated()) {
            if (biddingCountUserProfile === null || biddingCountUserProfile === undefined) {
                res.redirect('/api/bid/userId/'+req.user.id+'/itemUserId/'+req.params.userId);
            }
        }

        delete req.session.returnTo;
        delete req.session.returnToCommodityName;
        delete req.session.userPublicInformation;
        delete req.session.notifications;
        delete req.session.redirectContactInforPath;
        delete req.session.userContactInformation;
        delete req.session.biddingCountUserProfile;
        delete req.session.userPublicComments;
        delete req.session.userPublicCurrentListing;
        res.render('userprofile', {
            isAuthenticated : req.isAuthenticated(),
            user: req.user,
            errorMessage: errorMessage,
            commodityNames: commodityNames,
            notifications: notifications,
            userPublicInformation: userPublicInformation,
            userContactInformation: userContactInformation,
            biddingCountUserProfile: biddingCountUserProfile,
            userPublicComments: userPublicComments,
            userPublicCurrentListing: userPublicCurrentListing,
        });
    } else {
        //set visited path to session. It uses to rediect to again to that page when login success.
        req.session.returnTo = req.path;
        res.redirect('/user/login');
    }
});

//add commodity details
router.get('/commodity/add', function(req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  //this will be needed to populate commodity names in top menu
  var commodityNames = req.session.commodityNames
  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path;
  if (commodityNames === null || commodityNames === undefined) {
    res.redirect('/api/commodity/names');
  }

  var notifications = req.session.notifications;
  //check whether notification session is set.
  if(req.isAuthenticated()) {
    if (notifications === null || notifications === undefined) {
      res.redirect('/api/notification/userId/'+req.user.id);
    }
  }

  delete req.session.returnToCommodityName;
  delete req.session.notifications;
  res.render('addcommodity', {
    commodityNames: commodityNames,
    notifications: notifications,
    user: req.user,
  });

  // //check whether use logged or not
  // var errorMessage = req.session.errorMessage || '';
  // delete req.session.errorMessage;
  // if(req.isAuthenticated()) {
  //   delete req.session.returnTo;
  //   res.render('addcommodity', {
  //     isAuthenticated : req.isAuthenticated(),
  //     user: req.user,
  //     errorMessage: errorMessage,
  //   });
  // } else {
  //   //set visited path to session. It uses to rediect to again to that page when login success.
  //   req.session.returnTo = req.path;
  //   console.log(req.session.returnTo);
  //   res.redirect('/user/login');
  // }
});

/* GET view search commodity page for item add*/
router.get('/items/search', function(req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  if(req.isAuthenticated()) {
    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var commodities = req.session.commodities;
    //check whether commodities session is set
    if (commodities === null || commodities === undefined) {
      res.redirect('/api/commodity/viewall');
    }

    var notifications = req.session.notifications;
    //check whether notification session is set.
    if(req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/'+req.user.id);
      }
    }

    req.session.commodities = null;
    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.notifications;
    res.render('searchcommodityadd', {
      isAuthenticated : req.isAuthenticated(),
      user: req.user,
      Commodities: commodities.rows,
      commodityNames: commodityNames,
      notifications: notifications,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login');
  }
});

/* GET view search results page*/
router.get('/items', function(req, res) {
  removeSessionParameterSellingPage(req);
  var searchResult = req.session.searchResult;
  var searchResultRemainingTime = req.session.searchResultRemainingTime;
  var maxPrice = req.session.maxPrice;
  var distinctCharacteristics = req.session.distinctCharacteristics;
  var selectedClass = req.session.selectedClass;
  var selectedSegment = req.session.selectedSegment;
  var keyword = req.session.keyword;
  var startPrice = req.session.startPrice ? req.session.startPrice: 0;
  var endPrice = req.session.endPrice ? req.session.endPrice: maxPrice;

  //this will be needed to populate commodity names in top menu
  var commodityNames = req.session.commodityNames;
  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path;
  if (commodityNames === null || commodityNames === undefined) {
    res.redirect('/api/commodity/names');
  }

  var notifications = req.session.notifications;
  //check whether notification session is set.
  if(req.isAuthenticated()) {
    if (notifications === null || notifications === undefined) {
      res.redirect('/api/notification/userId/'+req.user.id);
    }
  }

  var itemsOffset = req.session.itemsOffset;
  var itemsCount = req.session.itemsCount;
  var currentPageNumber = (parseInt(itemsOffset)/10)+1;
  var maxPageCount = Math.floor(itemsCount/10);
  //Note: check whether equation is correct. previous one is maxPageCount % 10 !== 0
  if(itemsCount % 10 !== 0) {
    maxPageCount++;
  }
  var pageMultipationFactor = Math.floor((parseInt(itemsOffset)/30));

  delete req.session.returnToCommodityName;
  delete req.session.notifications;
  res.render('searchresults', {
    items: searchResult,
    remainingTimes: searchResultRemainingTime,
    distinctCharacteristics: distinctCharacteristics,
    maxPrice: maxPrice,
    selectedClass: selectedClass,
    selectedSegment: selectedSegment,
    keyword: keyword,
    currentPageNumber: currentPageNumber,
    maxPageCount: maxPageCount,
    pageMultipationFactor: pageMultipationFactor,
    startPrice: startPrice,
    endPrice: endPrice,
    commodityNames: commodityNames,
    notifications: notifications,
    user: req.user,
  });

});

/* GET view search commodity page for item add*/
router.get('/items/add/commoditydetails', function(req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  if(req.isAuthenticated()) {
    var commodity = req.session.commodity;

    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    //check whether notification session is set.
    if(req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/'+req.user.id);
      }
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.notifications;
    res.render('commoditydetailsadd', {
      isAuthenticated : req.isAuthenticated(),
      user: req.user,
      Commodity: commodity,
      CommodityAlterNames: commodity.CommodityAlterNames,
      CommodityImages: commodity.CommodityImages,
      CommodityParameters: commodity.CommodityParameters,
      commodityNames: commodityNames,
      CommodityMeasureUnits: commodity.CommodityMeasureUnits,
      notifications: notifications,
     });
    } else {
      //set visited path to session. It uses to rediect to again to that page when login success.
      req.session.returnTo = req.path;
      res.redirect('/user/login');
    }

});

/* GET view item add page*/
router.get('/items/add', function(req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  if(req.isAuthenticated()) {
    var commodityId = req.query['id'];
    if(commodityId !== null && commodityId !== undefined) {
      req.session.commodityId = commodityId;
    }
    var warehouses = req.session.warehouses;
    var measureUnits = req.session.measureUnits;
    var priceUnits = req.session.priceUnits;

    //check whether warehouses session is set
    if (warehouses === null || warehouses === undefined) {
      res.redirect('/api/user/view/warehouses/userId/'+req.user.id);
    }

    //check whether commodityMeasurements session is set
    if (measureUnits === null || measureUnits === undefined) {
      res.redirect('/api/commodity/measureUnits/id/'+req.session.commodityId);
    }

    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    //check whether notification session is set.

      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/'+req.user.id);
      }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.priceUnits;
    delete req.session.measureUnits;
    delete req.session.warehouses;
    delete req.session.notifications;
    res.render('additem', {
      isAuthenticated : req.isAuthenticated(),
      user: req.user,
      CommodityId: req.session.commodityId,
      WareHouses: warehouses,
      measureUnits: measureUnits,
      priceUnits: priceUnits,
      commodityNames: commodityNames,
      notifications: notifications,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login');
  }
});

/* GET view item add page*/
router.get('/items/add', function(req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  if(req.isAuthenticated()) {
    var commodityId = req.query['id'];
    if(commodityId !== null && commodityId !== undefined) {
      req.session.commodityId = commodityId;
    }
    var warehouses = req.session.warehouses;
    var measureUnits = req.session.measureUnits;
    var priceUnits = req.session.priceUnits;

    //check whether warehouses session is set
    if (warehouses === null || warehouses === undefined) {
      res.redirect('/api/user/view/warehouses/userId/'+req.user.id);
    }

    //check whether commodityMeasurements session is set
    if (measureUnits === null || measureUnits === undefined) {
      res.redirect('/api/commodity/measureUnits/id/'+req.session.commodityId);
    }

    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    //check whether notification session is set.

    if (notifications === null || notifications === undefined) {
      res.redirect('/api/notification/userId/'+req.user.id);
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.priceUnits;
    delete req.session.measureUnits;
    delete req.session.warehouses;
    delete req.session.notifications;
    res.render('additem', {
      isAuthenticated : req.isAuthenticated(),
      user: req.user,
      CommodityId: req.session.commodityId,
      WareHouses: warehouses,
      measureUnits: measureUnits,
      priceUnits: priceUnits,
      commodityNames: commodityNames,
      notifications: notifications,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login');
  }
});

router.get('/items/id/:id', function(req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);
  if(req.isAuthenticated()) {
    var item = req.session.specificBiddingItem;
    var bidwarehouses = req.session.bidwarehouses;
    var lastBid = req.session.lastBid;
    var lastUserBid = req.session.lastUserBid;
    var user = req.user;

    //check whether item is retrieved from database
    if (item === null || item === undefined) {
      res.redirect('/api/items/id/'+req.params.id);
    }

    //check whether bid details are retrieved from database
    if (lastBid === null || lastBid === undefined) {
      res.redirect('/api/bid/items/userId/'+user.id+'/itemId/'+req.params.id);
    }


    //check whether user is set. this is needed to retrieve user's warehouses
    if ((bidwarehouses === null || bidwarehouses === undefined) && (user !=null && user != undefined)) {
      res.redirect('/api/user/bidding/warehouses/userId/'+user.id+'/itemId/'+item.item.id);
    }

    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    //check whether notification session is set.
    if(req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/'+req.user.id);
      }
    }

    req.session.lastBid = null;
    req.session.lastUserBid = null;
    req.session.specificBiddingItem = null;

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.notifications;
    res.render('bidpage', {
      isAuthenticated : req.isAuthenticated(),
      user: req.user,
      item: item,
      userWareHouses: bidwarehouses,
      itemComments: item.itemComments,
      lastBid: lastBid[0],
      lastUserBid: lastUserBid[0],
      commodityNames: commodityNames,
      notifications: notifications,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login');
  }
});

//view selling details of user
router.get('/user/sell/list/start/:start', function(req, res) {
    removeSessionParameters(req);

    // check whether use logged or not
    if(req.isAuthenticated()) {
      var user = req.user;
      var sellingList = req.session.sellingList;
      var remainingTimes = req.session.searchResultRemainingTimeSelling;
      var filterParamer = req.session.sellpageItemOption;

      //check whether sellingList session is set
      if (sellingList === null || sellingList === undefined) {
        res.redirect('/api/items/start/'+req.params.start+'/userId/'+user.id);
      }

      //this will be needed to populate commodity names in top menu
      var commodityNames = req.session.commodityNames
      //check whether commodityNames session is set
      req.session.returnToCommodityName = req.path;
      if (commodityNames === null || commodityNames === undefined) {
        res.redirect('/api/commodity/names');
      }

      var notifications = req.session.notifications;
      //check whether notification session is set.
      if(req.isAuthenticated()) {
        if (notifications === null || notifications === undefined) {
          res.redirect('/api/notification/userId/'+req.user.id);
        }
      }

      var itemsOffset = req.session.itemsSellingAccountOffset;
      var itemsCount = req.session.itemsSellingAccountCount;
      var currentPageNumber = (parseInt(itemsOffset)/10)+1;
      var maxPageCount = Math.floor(itemsCount/10);
      //Note: check whether equation is correct. previous one is maxPageCount % 10 !== 0
      if(itemsCount % 10 !== 0) {
        maxPageCount++;
      }
      var pageMultipationFactor = Math.floor((parseInt(itemsOffset)/30));

      req.session.sellingList = null;
      delete req.session.itemsSellingAccountOffset;
      delete req.session.itemsSellingAccountCount;
      delete req.session.returnTo;
      delete req.session.returnToCommodityName;
      delete req.session.notifications;
      res.render('useraccountselling', {
        isAuthenticated : req.isAuthenticated(),
        user: req.user,
        sellingList: sellingList[0],
        biddingDetailList: sellingList[1],
        remainingTimes: remainingTimes,
        currentPageNumber: currentPageNumber,
        maxPageCount: maxPageCount,
        pageMultipationFactor: pageMultipationFactor,
        filterParamer: filterParamer,
        commodityNames: commodityNames,
        notifications: notifications,
      });
    } else {
      //set visited path to session. It uses to rediect to again to that page when login success.
      req.session.returnTo = req.path;
      res.redirect('/user/login');
    }
});


//view bidding details of user
router.get('/user/buy/list/start/:start', function(req, res) {
  removeSessionParameters(req);

  // check whether use logged or not
  if(req.isAuthenticated()) {
    var user = req.user;
    var buyingList = req.session.buyingList;
    var remainingTimes = req.session.searchResultRemainingTimeBuying;
    var filterParamer = req.session.buyingpageItemOption;

    //check whether biddinglist session is set
    if (buyingList === null || buyingList === undefined) {
      res.redirect('/api/bid/start/'+req.params.start+'/userId/'+user.id);
    }
    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    //check whether notification session is set.
    if(req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/'+req.user.id);
      }
    }

    var biddingsOffset = req.session.itemsBuyingAccountOffset;
    var biddingsCount = req.session.itemsBuyingAccountCount;
    var currentPageNumber = (parseInt(biddingsOffset)/10)+1;
    var maxPageCount = Math.floor(biddingsCount/10);
    //Note: check whether equation is correct. previous one is maxPageCount % 10 !== 0
    if(biddingsCount % 10 !== 0) {
      maxPageCount++;
    }
    var pageMultipationFactor = Math.floor((parseInt(biddingsOffset)/30));

    req.session.buyingList = null;
    delete req.session.itemsBuyingAccountOffset;
    delete req.session.itemsBuyingAccountCount;
    delete req.session.returnTo;
    delete req.session.notifications;
    res.render('useraccountbuying', {
      //isAuthenticated : req.isAuthenticated(),
      user: user,
      buyingList: buyingList[0],
      itemImages: buyingList[1],
      lastBid: buyingList[2],
      remainingTimes: remainingTimes,
      currentPageNumber: currentPageNumber,
      maxPageCount: maxPageCount,
      pageMultipationFactor: pageMultipationFactor,
      filterParamer: filterParamer,
      commodityNames: commodityNames,
      notifications: notifications,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login');
  }
});


//view biddings for particular item
router.get('/user/sell/bids/start/:start', function(req, res) {
    removeSessionParameters(req);
    removeSessionParameterSellingPage(req);

    //check whether use logged or not
    if(req.isAuthenticated()) {
      var biddingDetails = req.session.biddingList;
      var userwarehousesSell = req.session.bidwarehouses;
      var specificBiddingItemSell = req.session.specificBiddingItemSell;
      var specificBiddingItemSellMeasureUnits = req.session.specificBiddingItemSellMeasureUnits;
      var specificBiddingItemSellPriceUnits = req.session.specificBiddingItemSellPriceUnits;

      //rereive data from reqeuest
      var itemId = req.param('itemId');
      var user = req.user;


      //check whether biddingList session is set
      if (biddingDetails === null || biddingDetails === undefined) {
        res.redirect('/api/bid/start/'+req.params.start+'/itemId/'+itemId);
      }

      //check whether user warehouses are set
      if(userwarehousesSell == null || userwarehousesSell == undefined ) {
        res.redirect('/api/user/sell/warehouses/userId/'+user.id+'/itemId/'+itemId);
      }

      //get currency & measure units

      //this will be needed to populate commodity names in top menu
      var commodityNames = req.session.commodityNames
      //check whether commodityNames session is set
      req.session.returnToCommodityName = req.path;
      if (commodityNames === null || commodityNames === undefined) {
        res.redirect('/api/commodity/names');
      }

      var notifications = req.session.notifications;
      //check whether notification session is set.
      if(req.isAuthenticated()) {
        if (notifications === null || notifications === undefined) {
          res.redirect('/api/notification/userId/'+req.user.id);
        }
      }

      var biddingList = req.session.biddingList[0];
      var bidsCreatedAt = req.session.biddingList[1];

      //pagination
      var biddingOffset = req.session.biddingSellingAccountOffset;
      var biddingCount = req.session.biddingSellingAccountCount;
      var currentPageNumber = (parseInt(biddingOffset)/10)+1;
      var maxPageCount = Math.floor(biddingCount/10);
      //Note: check whether equation is correct. previous one is maxPageCount % 10 !== 0
      if(biddingCount % 10 !== 0) {
        maxPageCount++;
      }
      var pageMultipationFactor = Math.floor((parseInt(biddingOffset)/30));

      console.log(specificBiddingItemSellPriceUnits);

      req.session.biddingList = null;
      req.session.bidwarehouses = null;
      req.session.specificBiddingItemSell = null;
      delete req.session.biddingSellingAccountOffset;
      delete req.session.bidwarehouses;
      delete req.session.biddingSellingAccountCount;
      delete req.session.returnTo;
      delete req.session.returnToCommodityName;
      delete req.session.specificBiddingItemSellMeasureUnits;
      delete req.session.specificBiddingItemSellPriceUnits;
      delete req.session.notifications;
      res.render('viewbiddingdetailsseller', {
        isAuthenticated : req.isAuthenticated(),
        user: req.user,
        item: specificBiddingItemSell,
        itemId: itemId,
        biddingList: biddingList,
        bidsCreatedAt: bidsCreatedAt,
        currentPageNumber: currentPageNumber,
        maxPageCount: maxPageCount,
        pageMultipationFactor: pageMultipationFactor,
        specificBiddingItemSellPriceUnits:specificBiddingItemSellPriceUnits,
        specificBiddingItemSellMeasureUnits: specificBiddingItemSellMeasureUnits,
        userWareHousesSell: userwarehousesSell,
        commodityNames: commodityNames,
        notifications: notifications,
      });
    } else {
      //set visited path to session. It uses to rediect to again to that page when login success.
      req.session.returnTo = req.path;
      res.redirect('/user/login');
    }
});

//view buyer contract
router.get('/user/buy/contract/id/:id', function(req, res) {
  removeSessionParameters(req);

  // check whether use logged or not
  if(req.isAuthenticated()) {
    var user = req.user;
    var itemId = req.params.id;
    var buyContractItem = req.session.buyContractItem;
    var buyContractBid = req.session.buyContractBid;
    var contractDate = req.session.contractDate;

    //check whether contractedItem session is set
    if (buyContractItem === null || buyContractItem === undefined) {
      res.redirect('/api/items/contract/id/'+itemId);
    }

    //check whether contractBid session is set
    if (buyContractBid === null || buyContractBid === undefined) {
      res.redirect('/api/bid/contract/userId/'+user.id+'/itemId/'+itemId);
    }

    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    //check whether notification session is set.
    if(req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/'+req.user.id);
      }
    }

    req.session.buyContractItem = null;
    req.session.buyContractBid = null;
    req.session.contractDate = null;
    delete req.session.returnTo;
    delete req.session.notifications;
    res.render('buyercontract', {
      isAuthenticated : req.isAuthenticated(),
      user: user,
      buyContractItem: buyContractItem,
      buyContractBid: buyContractBid,
      commodityNames: commodityNames,
      notifications: notifications,
      contractDate: contractDate,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login');
  }
});

//view seller contract
router.get('/user/sell/contract/bidId/:bidId', function(req, res) {
  removeSessionParameters(req);

  // check whether use logged or not
  if(req.isAuthenticated()) {
    var user = req.user;
    var bidId = req.params.bidId;
    var sellContractItem = req.session.buyContractItem;
    var sellContractBid = req.session.sellContractBid;
    var contractDate = req.session.contractDate;

    // //check whether contractedItem session is set
    // if (sellContractItem === null || sellContractItem === undefined) {
    //   res.redirect('/api/items/sellcontract/id/'+itemId+'/bidId/'+bidId);
    // }

    //check whether contractBid session is set
    if (sellContractBid === null || sellContractBid === undefined) {
      res.redirect('/api/bid/sellcontract/bidId/'+bidId);
    }

    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    //check whether notification session is set.
    if(req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/'+req.user.id);
      }
    }

    req.session.buyContractItem = null;
    req.session.sellContractBid = null;
    req.session.contractDate = null;
    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.notifications;
    res.render('sellercontract', {
      isAuthenticated : req.isAuthenticated(),
      user: user,
      sellContractItem: sellContractItem,
      sellContractBid: sellContractBid,
      commodityNames: commodityNames,
      notifications: notifications,
      contractDate: contractDate,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login');
  }
});

router.get('/testtwilio', function(req, res) {
  // // Twilio Credentials
  // var helper = require('sendgrid').mail
  //
  // from_email = new helper.Email("kjtdimuthu.13@cse.mrt.ac.lk")
  // to_email = new helper.Email('kjtdimuthu@gmail.com');
  // subject = "Ticket Booking"
  // content = new helper.Content("text/plain", "Thank you for booking. If any inquiry call +94777323498")
  // mail = new helper.Mail(from_email, subject, to_email, content)
  //
  // var sg = require('sendgrid')('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');
  // var request = sg.emptyRequest({
  //   method: 'POST',
  //   path: '/v3/mail/send',
  //   body: mail.toJSON()
  // });
  //
  // sg.API(request, function(error, response) {
  //   console.log(response.statusCode)
  //   console.log(response.body)
  //   console.log(response.headers);
  //   res.json(['Yeeii']);
  // });
});

//to remove unnecessary session parameters
function removeSessionParameters(req) {
  delete req.session.selectedClass;
  delete req.session.selectedSegment;
  delete req.session.keyword;
  delete req.session.startPrice;
  delete req.session.endPrice;
}

//remove unnecessary session paramters when created at user selling page, when switching to other routes
function removeSessionParameterSellingPage(req) {
    delete req.session.sellpageItemOption;
}
module.exports = router;
