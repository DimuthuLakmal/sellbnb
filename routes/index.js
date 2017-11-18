var express = require('express');
var _ = require('lodash');
var router = express.Router();
var CommodityController = require('../controller/commodity');
var async = require('async');


//view home page
router.get('/', function (req, res) {
  removeSessionParameterSellingPage(req);
  removeSessionParameters(req);

  if (req.session.language === null || req.session.language === undefined) {
    req.session.language = "english";
  }

  //retrieve required data from session
  var commodityPopular = req.session.commodityPopular;
  var commodityNames = req.session.commodityNames;
  var latestItems = req.session.latestItems;
  var notifications = req.session.notifications;
  var messages = req.session.messages;
  var bestsellers = req.session.bestsellers;
  var recentsearches = req.session.recentsearches;
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
    res.redirect('/api/user/bestsellers');
  }

  //check whether top rated items session is set
  if (neartocloseItems === null || neartocloseItems === undefined) {
    res.redirect('/api/items/neartoclose');
  }

  if (req.user != null && req.user != undefined) {
    //check whether Near to bidding close items session is set
    if (recentsearches === null || recentsearches === undefined) {
      res.redirect('/api/recentsearch/userId/' + req.user.id);
    }
  } else {
    //check whether Near to bidding close items session is set
    if (recentsearches === null || recentsearches === undefined) {
      res.redirect('/api/recentsearch/userId/' + null);
    }
  }

  //load recent seraches
  if (latestNews === null || latestNews === undefined) {
    res.redirect('/api/news/viewlatest');
  }

  //check whether notification session is set.
  if (req.isAuthenticated()) {
    if (notifications === null || notifications === undefined) {
      res.redirect('/api/notification/userId/' + req.user.id);
    }
    if (messages === null || messages === undefined) {
      res.redirect('/api/messages/userId/' + req.user.id);
    }
  }

  //check whether latest items session is set
  if (latestItems === null || latestItems === undefined) {
    res.redirect('/api/items/viewlatest');
  }

  console.log('Index Page Visited');

  delete req.session.returnTo;
  delete req.session.returnToCommodityName;
  delete req.session.commodityPopular;
  delete req.session.latestItems;
  delete req.session.latestItems;
  delete req.session.bestsellers;
  delete req.session.neartocloseItems;
  delete req.session.notifications;
  delete req.session.messages;
  delete req.session.recentsearches;
  res.render('index', {
    commodityNames: commodityNames,
    latestItems: latestItems,
    commodityPopular: commodityPopular,
    notifications: notifications,
    messages: messages,
    bestsellers: bestsellers,
    recentsearches: recentsearches,
    neartocloseItems: neartocloseItems,
    latestNews: latestNews,
    user: req.user,
  });

});

/* GET add news page. */
router.get('/addnews', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  if (req.isAuthenticated()) {
    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var families = req.session.families;
    if (families === null || families === undefined) {
      res.redirect('/api/commodity/families?add=true');
    }

    var newsTitles = req.session.newsTitles;
    if (newsTitles === null || newsTitles === undefined) {
      res.redirect('/api/news/titles');
    }

    var notifications = req.session.notifications;
    var messages = req.session.messages;
    //check whether notification session is set.
    if (req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/' + req.user.id);
      }
      if (messages === null || messages === undefined) {
        res.redirect('/api/messages/userId/' + req.user.id);
      }
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.notifications;
    delete req.session.messages;
    delete req.session.families;
    delete req.session.newsTitles;
    res.render('addnews', {
      commodityNames: commodityNames,
      notifications: notifications,
      messages: messages,
      user: req.user,
      families: families,
      newsTitles: newsTitles,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login?action=login');
  }

});

/* GET view first news page. */
router.get('/news/start/:start', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);
  var newsAll = req.session.newsall;
  var newsOffset = req.session.newsOffset;
  var newsCount = req.session.newsCount;
  var currentPageNumber = (parseInt(newsOffset) / 3) + 1;
  var maxPageCount = Math.floor(newsCount / 3);
  //Note: check whether equation is correct. previous one is maxPageCount % 10 !== 0
  if (newsCount % 3 !== 0) {
    maxPageCount++;
  }
  var pageMultipationFactor = Math.floor((parseInt(newsOffset) / 9));

  //check whether newsAll session is set
  if (newsAll === null || newsAll === undefined) {
    res.redirect('/api/news/start/' + req.params.start + '?category=' + req.query['category'] + '&keyword=' + req.query['keyword']);
  }

  //this will be needed to populate commodity names in top menu
  var commodityNames = req.session.commodityNames;
  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path + '?category=' + req.query['category'] + '&keyword=' + req.query['keyword'];
  if (commodityNames === null || commodityNames === undefined) {
    res.redirect('/api/commodity/names');
  }

  var notifications = req.session.notifications;
  var messages = req.session.messages;
  //check whether notification session is set.
  if (req.isAuthenticated()) {
    if (notifications === null || notifications === undefined) {
      res.redirect('/api/notification/userId/' + req.user.id);
    }
    if (messages === null || messages === undefined) {
      res.redirect('/api/messages/userId/' + req.user.id);
    }
  }

  req.session.newsall = null;
  req.session.newsOffset = null;
  req.session.newsCount = null;
  delete req.session.returnToCommodityName;
  delete req.session.notifications;
  delete req.session.messages;
  res.render('viewnewsall', {
    News: newsAll,
    currentPageNumber: currentPageNumber,
    maxPageCount: maxPageCount,
    pageMultipationFactor: pageMultipationFactor,
    commodityNames: commodityNames,
    URLkeyword: req.query['keyword'],
    URLcategory: req.query['category'],
    notifications: notifications,
    messages: messages,
    user: req.user,
  });
});

// /* GET view news page other than first page */
// router.get('/news/start/:start', function (req, res) {
//     removeSessionParameters(req);
//     removeSessionParameterSellingPage(req);
//     var newsAll = req.session.newsall;
//     var newsOffset = req.session.newsOffset;
//     var newsCount = req.session.newsCount;
//     var currentPageNumber = (parseInt(newsOffset) / 3) + 1;
//     var maxPageCount = Math.floor(newsCount / 3);
//     //Note: check whether equation is correct. previous one is maxPageCount % 10 !== 0
//     if (newsCount % 3 !== 0) {
//         maxPageCount++;
//     }
//     var pageMultipationFactor = Math.floor((parseInt(newsOffset) / 9));
//
//     //check whether newsAll session is set
//     if (newsAll === null || newsAll === undefined) {
//         res.redirect('/api/news/viewall/start/' + req.params.start);
//     }
//
//     //this will be needed to populate commodity names in top menu
//     var commodityNames = req.session.commodityNames
//     //check whether commodityNames session is set
//     req.session.returnToCommodityName = req.path;
//     if (commodityNames === null || commodityNames === undefined) {
//         res.redirect('/api/commodity/names');
//     }
//
//     var notifications = req.session.notifications;
//     var messages = req.session.messages;
//     //check whether notification session is set.
//     if (req.isAuthenticated()) {
//         if (notifications === null || notifications === undefined) {
//             res.redirect('/api/notification/userId/' + req.user.id);
//         }
//         if (messages === null || messages === undefined) {
//             res.redirect('/api/messages/userId/' + req.user.id);
//         }
//     }
//
//     req.session.newsall = null;
//     req.session.newsOffset = null;
//     req.session.newsCount = null;
//     delete req.session.returnToCommodityName;
//     delete req.session.notifications;
//     delete req.session.messages;
//     res.render('viewnewsall', {
//         News: newsAll,
//         currentPageNumber: currentPageNumber,
//         maxPageCount: maxPageCount,
//         pageMultipationFactor: pageMultipationFactor,
//         commodityNames: commodityNames,
//         notifications: notifications,
//         messages: messages,
//         user: req.user,
//     });
// });

/* GET view single news page*/
router.get('/news/id/:id', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);
  var news = req.session.specificNews;

  //check whether newsAll session is set
  if (news === null || news === undefined) {
    res.redirect('/api/news/id/' + req.params.id + '?lan=' + req.query['lan']);
  }

  //this will be needed to populate commodity names in top menu
  var commodityNames = req.session.commodityNames
  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path + '?lan=' + req.query['lan'];
  if (commodityNames === null || commodityNames === undefined) {
    res.redirect('/api/commodity/names');
  }

  var notifications = req.session.notifications;
  var messages = req.session.messages;
  //check whether notification session is set.
  if (req.isAuthenticated()) {
    if (notifications === null || notifications === undefined) {
      res.redirect('/api/notification/userId/' + req.user.id);
    }
    if (messages === null || messages === undefined) {
      res.redirect('/api/messages/userId/' + req.user.id);
    }
  }

  req.session.specificNews = null;
  delete req.session.returnToCommodityName;
  delete req.session.notifications;
  delete req.session.messages;
  res.render('viewnews', {
    News: news,
    commodityNames: commodityNames,
    notifications: notifications,
    messages: messages,
    user: req.user,
  });
});


//view basic details
router.get('/user/basic', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  //check whether use logged or not
  var errorMessage = req.session.errorMessage || '';
  delete req.session.errorMessage;
  if (req.isAuthenticated()) {
    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    var messages = req.session.messages;
    //check whether notification session is set.
    if (req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/' + req.user.id);
      }
      if (messages === null || messages === undefined) {
        res.redirect('/api/messages/userId/' + req.user.id);
      }
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.notifications;
    delete req.session.messages;
    res.render('useraccountbasics', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      errorMessage: errorMessage,
      commodityNames: commodityNames,
      notifications: notifications,
      messages: messages,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login?action=login');
  }
});


//view contact details
router.get('/user/contact', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  //check whether use logged or not
  var errorMessage = req.session.errorMessage || '';

  if (req.isAuthenticated()) {
    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    var messages = req.session.messages;
    //check whether notification session is set.
    if (req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/' + req.user.id);
      }
      if (messages === null || messages === undefined) {
        res.redirect('/api/messages/userId/' + req.user.id);
      }
    }

    var userContactInformation = req.session.userContactInformation;
    //retreive user contact information
    if (req.isAuthenticated()) {
      req.session.redirectContactInforPath = req.path;
      if (userContactInformation === null || userContactInformation === undefined) {
        res.redirect('/api/user/contactinfo/userId/' + req.user.id);
      }
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.errorMessage;
    delete req.session.userContactInformation;
    delete req.session.notifications;
    delete req.session.messages;
    delete req.session.redirectContactInforPath;
    res.render('useraccountcontactinformation', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      errorMessage: errorMessage,
      commodityNames: commodityNames,
      notifications: notifications,
      messages: messages,
      userContactInformation: userContactInformation,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login?action=login');
  }
});

//view user business details
router.get('/user/business', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  //check whether use logged or not
  var errorMessage = req.session.errorMessage || '';
  delete req.session.errorMessage;
  if (req.isAuthenticated()) {
    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    var messages = req.session.messages;
    //check whether notification session is set.
    if (req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/' + req.user.id);
      }
      if (messages === null || messages === undefined) {
        res.redirect('/api/messages/userId/' + req.user.id);
      }
    }

    var userTradingBusinessInformation = req.session.userTradingBusinessInformation;
    //check whether notification session is set.
    if (req.isAuthenticated()) {
      if (userTradingBusinessInformation === null || userTradingBusinessInformation === undefined) {
        res.redirect('/api/user/businessinfo/userId/' + req.user.id);
      }
    }

    var userCertificateInformation = req.session.userCertificateInformation;
    //check whether notification session is set.
    if (req.isAuthenticated()) {
      if (userCertificateInformation === null || userCertificateInformation === undefined) {
        res.redirect('/api/user/certificateinfo/userId/' + req.user.id);
      }
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.userCertificateInformation;
    delete req.session.userTradingBusinessInformation;
    delete req.session.notifications;
    delete req.session.messages;
    res.render('userbusinessinformation', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      errorMessage: errorMessage,
      commodityNames: commodityNames,
      notifications: notifications,
      messages: messages,
      userTradingBusinessInformation: userTradingBusinessInformation,
      userCertificateInformation: userCertificateInformation,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login?action=login');
  }
});

//view user payment details
router.get('/user/payment', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  //check whether use logged or not
  var errorMessage = req.session.errorMessage || '';
  delete req.session.errorMessage;
  if (req.isAuthenticated()) {
    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    var messages = req.session.messages;
    //check whether notification session is set.
    if (req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/' + req.user.id);
      }
      if (messages === null || messages === undefined) {
        res.redirect('/api/messages/userId/' + req.user.id);
      }
    }

    var userPaymentInformation = req.session.userPaymentInformation;
    //retreive user payment information
    if (req.isAuthenticated()) {
      if (userPaymentInformation === null || userPaymentInformation === undefined) {
        res.redirect('/api/user/paymentinfo/userId/' + req.user.id);
      }
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.userPaymentInformation;
    delete req.session.notifications;
    delete req.session.messages;
    res.render('userpaymentinformation', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      errorMessage: errorMessage,
      commodityNames: commodityNames,
      notifications: notifications,
      messages: messages,
      userPaymentInformation: userPaymentInformation,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login?action=login');
  }
});


//view user notification details
router.get('/user/notification', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  //check whether use logged or not
  var errorMessage = req.session.errorMessage || '';
  delete req.session.errorMessage;
  if (req.isAuthenticated()) {
    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    var messages = req.session.messages;
    //check whether notification session is set.
    if (req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/' + req.user.id);
      }
      if (messages === null || messages === undefined) {
        res.redirect('/api/messages/userId/' + req.user.id);
      }
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.notifications;
    delete req.session.messages;
    res.render('usernotificationpreference', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      errorMessage: errorMessage,
      commodityNames: commodityNames,
      notifications: notifications,
      messages: messages,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login?action=login');
  }
});

//view user payment details
router.get('/user/public/userId/:userId', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  //check whether use logged or not
  var errorMessage = req.session.errorMessage || '';
  delete req.session.errorMessage;
  if (req.isAuthenticated()) {
    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    var messages = req.session.messages;
    //check whether notification session is set.
    if (req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/' + req.user.id);
      }
      if (messages === null || messages === undefined) {
        res.redirect('/api/messages/userId/' + req.user.id);
      }
    }

    //retrieve user's public details
    var userPublicInformation = req.session.userPublicInformation;
    var userPublicComments = req.session.userPublicComments;
    var userPublicCurrentListing = req.session.userPublicCurrentListing;
    if (userPublicInformation === null || userPublicInformation === undefined) {
      res.redirect('/api/user/public/userId/' + req.params.userId);
    }


    var userContactInformation = req.session.userContactInformation;
    //retreive user contact information
    if (req.isAuthenticated()) {
      req.session.redirectContactInforPath = req.path;
      if (userContactInformation === null || userContactInformation === undefined) {
        res.redirect('/api/user/contactinfo/userId/' + req.user.id);
      }
    }

    var biddingCountUserProfile = req.session.biddingCountUserProfile;
    //retreive user contact information
    if (req.isAuthenticated()) {
      if (biddingCountUserProfile === null || biddingCountUserProfile === undefined) {
        res.redirect('/api/bid/userId/' + req.user.id + '/itemUserId/' + req.params.userId);
      }
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.userPublicInformation;
    delete req.session.notifications;
    delete req.session.messages;
    delete req.session.redirectContactInforPath;
    delete req.session.userContactInformation;
    delete req.session.biddingCountUserProfile;
    delete req.session.userPublicComments;
    delete req.session.userPublicCurrentListing;
    res.render('userprofile', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      errorMessage: errorMessage,
      commodityNames: commodityNames,
      notifications: notifications,
      messages: messages,
      userPublicInformation: userPublicInformation,
      userContactInformation: userContactInformation,
      biddingCountUserProfile: biddingCountUserProfile,
      userPublicComments: userPublicComments,
      userPublicCurrentListing: userPublicCurrentListing,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login?action=login');
  }
});

//add commodity details
router.get('/commodity/add', function (req, res) {
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
  var messages = req.session.messages;
  //check whether notification session is set.
  if (req.isAuthenticated()) {
    if (notifications === null || notifications === undefined) {
      res.redirect('/api/notification/userId/' + req.user.id);
    }
    if (messages === null || messages === undefined) {
      res.redirect('/api/messages/userId/' + req.user.id);
    }
  }

  delete req.session.returnToCommodityName;
  delete req.session.notifications;
  delete req.session.messages;
  res.render('addcommodity', {
    commodityNames: commodityNames,
    notifications: notifications,
    messages: messages,
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
  //   res.redirect('/user/login?action=login');
  // }
});

/* GET view search commodity page for item add*/
router.get('/items/search', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  if (req.isAuthenticated()) {

    var recentSearches = req.session.recentSearches;
    if (recentSearches === null || recentSearches === undefined) {
      res.redirect('/api/commodity/recentsearch/userId/' + req.user.id);
    }

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
    var messages = req.session.messages;
    //check whether notification session is set.
    if (req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/' + req.user.id);
      }
      if (messages === null || messages === undefined) {
        res.redirect('/api/messages/userId/' + req.user.id);
      }
    }

    req.session.commodities = null;
    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.notifications;
    delete req.session.messages;
    delete req.session.recentSearches;
    res.render('searchcommodityadd', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      Commodities: commodities.rows,
      commodityNames: commodityNames,
      notifications: notifications,
      messages: messages,
      recentSearches: recentSearches,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login?action=login');
  }
});

/* GET view search results page*/
router.get('/items', function (req, res) {
  removeSessionParameterSellingPage(req);
  var searchResult = req.session.searchResult;
  var searchResultRemainingTime = req.session.searchResultRemainingTime;
  var maxPrice = (req.session.maxPrice != undefined && req.session.maxPrice != null) ? req.session.maxPrice.split(" ")[1] : 10000;
  var distinctCharacteristics = req.session.distinctCharacteristics;
  var selectedClass = req.session.selectedClass;
  var selectedSegment = req.session.selectedSegment;
  var selectedLocation = req.session.selectedLocation;
  var keyword = req.session.keyword;
  var startPrice = req.session.startPrice ? req.session.startPrice : 0;
  var endPrice = req.session.endPrice ? req.session.endPrice : maxPrice;

  //this will be needed to populate commodity names in top menu
  var commodityNames = req.session.commodityNames;
  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path;
  if (commodityNames === null || commodityNames === undefined) {
    res.redirect('/api/commodity/names');
  }

  var notifications = req.session.notifications;
  var messages = req.session.messages;
  //check whether notification session is set.
  if (req.isAuthenticated()) {
    if (notifications === null || notifications === undefined) {
      res.redirect('/api/notification/userId/' + req.user.id);
    }
    if (messages === null || messages === undefined) {
      res.redirect('/api/messages/userId/' + req.user.id);
    }
  }

  var itemsOffset = req.session.itemsOffset;
  var itemsCount = req.session.itemsCount;
  var currentPageNumber = (parseInt(itemsOffset) / 10) + 1;
  var maxPageCount = Math.floor(itemsCount / 10);
  //Note: check whether equation is correct. previous one is maxPageCount % 10 !== 0
  if (itemsCount % 10 !== 0) {
    maxPageCount++;
  }
  var pageMultipationFactor = Math.floor((parseInt(itemsOffset) / 30));

  delete req.session.returnToCommodityName;
  delete req.session.notifications;
  delete req.session.messages;
  //ToDO remove unncessary session parameters
  res.render('searchresults', {
    items: searchResult,
    remainingTimes: searchResultRemainingTime,
    distinctCharacteristics: distinctCharacteristics,
    maxPrice: maxPrice,
    selectedClass: selectedClass,
    selectedSegment: selectedSegment,
    selectedLocation: selectedLocation,
    keyword: keyword,
    currentPageNumber: currentPageNumber,
    maxPageCount: maxPageCount,
    pageMultipationFactor: pageMultipationFactor,
    startPrice: startPrice,
    endPrice: endPrice,
    commodityNames: commodityNames,
    notifications: notifications,
    messages: messages,
    user: req.user,
  });

});

/* GET view search commodity page for item add*/
router.get('/items/add/commoditydetails', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  if (req.isAuthenticated()) {
    var commodity = req.session.commodity;

    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    var messages = req.session.messages;
    //check whether notification session is set.
    if (req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/' + req.user.id);
      }
      if (messages === null || messages === undefined) {
        res.redirect('/api/messages/userId/' + req.user.id);
      }
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.notifications;
    delete req.session.messages;
    res.render('commoditydetailsadd', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      Commodity: commodity,
      CommodityAlterNames: commodity.CommodityAlterNames,
      CommodityImages: commodity.CommodityImages,
      CommodityParameters: commodity.CommodityParameters,
      commodityNames: commodityNames,
      CommodityMeasureUnits: commodity.CommodityMeasureUnits,
      notifications: notifications,
      messages: messages,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login?action=login');
  }

});

/* GET view item add page*/
router.get('/items/add', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  if (req.isAuthenticated()) {
    var commodityId = req.query['id'];
    if (commodityId !== null && commodityId !== undefined) {
      req.session.commodityId = commodityId;
    }
    var warehouses = req.session.warehouses;
    var measureUnits = req.session.measureUnits;
    var priceUnits = req.session.priceUnits;
    var packingTypes = req.session.packingTypes;
    var commodityName = req.session.commodityName;

    //check whether warehouses session is set
    if (warehouses === null || warehouses === undefined) {
      res.redirect('/api/user/view/warehouses/userId/' + req.user.id);
    }

    //check whether commodityMeasurements session is set
    if (measureUnits === null || measureUnits === undefined) {
      res.redirect('/api/commodity/measureUnits/id/' + req.session.commodityId);
    }

    //check whether commodityName session is set
    if (commodityName === null || commodityName === undefined) {
      res.redirect('/api/commodity/commodityName/id/' + req.session.commodityId);
    }

    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    var messages = req.session.messages;
    //check whether notification session is set.

    if (notifications === null || notifications === undefined) {
      res.redirect('/api/notification/userId/' + req.user.id);
    }
    if (messages === null || messages === undefined) {
      res.redirect('/api/messages/userId/' + req.user.id);
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.priceUnits;
    delete req.session.measureUnits;
    delete req.session.packingTypes;
    delete req.session.warehouses;
    delete req.session.notifications;
    delete req.session.messages;
    delete req.session.previewImages;
    delete req.session.commodityName;
    res.render('additem', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      CommodityId: req.session.commodityId,
      WareHouses: warehouses,
      measureUnits: measureUnits,
      priceUnits: priceUnits,
      packingTypes: packingTypes,
      commodityName: commodityName,
      commodityNames: commodityNames,
      notifications: notifications,
      messages: messages,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login?action=login');
  }
});

/* GET view item add page*/
router.get('/items/add', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  if (req.isAuthenticated()) {
    var commodityId = req.query['id'];
    if (commodityId !== null && commodityId !== undefined) {
      req.session.commodityId = commodityId;
    }
    var warehouses = req.session.warehouses;
    var measureUnits = req.session.measureUnits;
    var priceUnits = req.session.priceUnits;

    //check whether warehouses session is set
    if (warehouses === null || warehouses === undefined) {
      res.redirect('/api/user/view/warehouses/userId/' + req.user.id);
    }

    //check whether commodityMeasurements session is set
    if (measureUnits === null || measureUnits === undefined) {
      res.redirect('/api/commodity/measureUnits/id/' + req.session.commodityId);
    }

    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    var messages = req.session.messages;
    //check whether notification session is set.

    if (notifications === null || notifications === undefined) {
      res.redirect('/api/notification/userId/' + req.user.id);
    }
    if (messages === null || messages === undefined) {
      res.redirect('/api/messages/userId/' + req.user.id);
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.priceUnits;
    delete req.session.measureUnits;
    delete req.session.warehouses;
    delete req.session.notifications;
    delete req.session.messages;
    res.render('additem', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      CommodityId: req.session.commodityId,
      WareHouses: warehouses,
      measureUnits: measureUnits,
      priceUnits: priceUnits,
      commodityNames: commodityNames,
      notifications: notifications,
      messages: messages,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login?action=login');
  }
});

router.get('/items/id/:id', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);
  if (req.isAuthenticated()) {
    var item = req.session.specificBiddingItem;
    var bidwarehouses = req.session.bidwarehouses;
    var lastBid = req.session.lastBid;
    var lastUserBid = req.session.lastUserBid;
    var userFeedback = req.session.bidpageUserFeedback;
    var user = req.user;
    var measureUnits = req.session.measureUnits;
    //check whether item is retrieved from database
    if (item === null || item === undefined) {
      res.redirect('/api/items/id/' + req.params.id + '/userId/' + user.id);
    }

    //check whether commodityMeasurements session is set
    if (measureUnits === null || measureUnits === undefined) {
      res.redirect('/api/commodity/measureUnits/id2/' + item.commodity.id);
    }

    //check whether item is retrieved from database
    if (userFeedback === null || userFeedback === undefined) {
      res.redirect('/api/user/userFeedback/id/' + item.user.id + '/itemId/' + req.params.id);
    }

    //check whether bid details are retrieved from database
    if (lastBid === null || lastBid === undefined) {
      res.redirect('/api/bid/items/userId/' + user.id + '/itemId/' + req.params.id);
    }


    //check whether user is set. this is needed to retrieve user's warehouses
    if ((bidwarehouses === null || bidwarehouses === undefined) && (user != null && user != undefined)) {
      res.redirect('/api/user/bidding/warehouses/userId/' + user.id + '/itemId/' + item.item.id);
    }

    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    var messages = req.session.messages;
    //check whether notification session is set.
    if (req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/' + req.user.id);
      }
      if (messages === null || messages === undefined) {
        res.redirect('/api/messages/userId/' + req.user.id);
      }
    }

    var message = req.session.bidAddMessage;

    console.log(item.user);

    req.session.lastBid = null;
    req.session.lastUserBid = null;
    req.session.specificBiddingItem = null;
    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.notifications;
    delete req.session.messages;
    delete req.session.bidAddMessage;
    delete req.session.bidpageUserFeedback;

    delete req.session.measureUnits;

    res.render('bidpage', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      item: item,
      userWareHouses: bidwarehouses,
      itemComments: item.itemComments,
      lastBid: lastBid[0],
      lastUserBid: lastUserBid[0],
      commodityNames: commodityNames,
      notifications: notifications,
      measureUnits: measureUnits,
      messages: messages,
      message: message,
      userFeedback: userFeedback,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login?action=login');
  }
});

//view selling details of user
router.get('/user/sell/list/start/:start', function (req, res) {
  removeSessionParameters(req);

  // check whether use logged or not
  if (req.isAuthenticated()) {

    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path + '?sellingpageItemOption=Open&openDurationOption=' + req.query['openDurationOption'] + '&pendingDurationOption=' + req.query['pendingDurationOption'] + '&cancelledDurationOption=' + req.query['cancelledDurationOption'];
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    var messages = req.session.messages;
    //check whether notification session is set.
    if (req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/' + req.user.id);
      }
      if (messages === null || messages === undefined) {
        res.redirect('/api/messages/userId/' + req.user.id);
      }
    }

    var user = req.user;
    var OpenItemsFinished = false;
    var PendingItemsFinished = false;
    var CancelledItemsFinished = false;

    if (req.query['sellingpageItemOption'] == 'Open') {
      req.session.sellingListOpen = req.session.sellingList;
      console.log(req.session.sellingListOpen);
      req.session.remainingTimesOpen = req.session.searchResultRemainingTimeSelling;

      //check whether itemlist session is set
      if (req.session.sellingListOpen === null || req.session.sellingListOpen === undefined) {
        res.redirect('/api/items/start/' + req.params.start + '/userId/' + user.id + '?sellingpageItemOption=Open&openDurationOption=' + req.query['openDurationOption'] + '&pendingDurationOption=' + req.query['pendingDurationOption'] + '&cancelledDurationOption=' + req.query['cancelledDurationOption']);
      }

      var itemsOffsetOpen = req.session.itemsSellingAccountOffset;
      var itemsCountOpen = req.session.itemsSellingAccountCount;
      req.session.currentPageNumberOpen = (parseInt(itemsOffsetOpen) / 10) + 1;
      req.session.maxPageCountOpen = Math.floor(itemsCountOpen / 10);
      //Note: check whether equation is correct. previous one is maxPageCount % 10 !== 0
      if (itemsCountOpen % 10 !== 0) {
        req.session.maxPageCountOpen++;
      }
      req.session.pageMultipationFactorOpen = Math.floor((parseInt(itemsOffsetOpen) / 30));

      req.session.sellingList = null;
      OpenItemsFinished = true;
    }
    if (OpenItemsFinished || req.query['sellingpageItemOption'] == 'Pending') {
      req.session.sellingListPending = req.session.sellingList;
      req.session.remainingTimesPending = req.session.searchResultRemainingTimeSelling;

      //check whether itemlist session is set
      if (req.session.sellingListPending === null || req.session.sellingListPending === undefined) {
        res.redirect('/api/items/start/' + req.params.start + '/userId/' + user.id + '?sellingpageItemOption=Pending&openDurationOption=' + req.query['openDurationOption'] + '&pendingDurationOption=' + req.query['pendingDurationOption'] + '&cancelledDurationOption=' + req.query['cancelledDurationOption']);
      }


      var itemsOffsetPending = req.session.itemsSellingAccountOffset;
      var itemsCountPending = req.session.itemsSellingAccountCount;
      req.session.currentPageNumberPending = (parseInt(itemsOffsetPending) / 10) + 1;
      req.session.maxPageCountPending = Math.floor(itemsCountPending / 10);
      //Note: check whether equation is correct. previous one is maxPageCount % 10 !== 0
      if (itemsCountPending % 10 !== 0) {
        req.session.maxPageCountPending++;
      }
      req.session.pageMultipationFactorPending = Math.floor((parseInt(itemsOffsetPending) / 30));

      req.session.sellingList = null;
      PendingItemsFinished = true;
    }
    if (PendingItemsFinished || req.query['sellingpageItemOption'] == 'Cancelled') {
      req.session.sellingListCancelled = req.session.sellingList;
      req.session.remainingTimesCancelled = req.session.searchResultRemainingTimeSelling;

      //check whether itemlist session is set
      if (req.session.sellingListCancelled === null || req.session.sellingListCancelled === undefined) {
        res.redirect('/api/items/start/' + req.params.start + '/userId/' + user.id + '?sellingpageItemOption=Cancelled&openDurationOption=' + req.query['openDurationOption'] + '&pendingDurationOption=' + req.query['pendingDurationOption'] + '&cancelledDurationOption=' + req.query['cancelledDurationOption']);
      }

      var itemsOffsetCancelled = req.session.itemsSellingAccountOffset;
      var itemsCountCancelled = req.session.itemsSellingAccountCount;
      req.session.currentPageNumberCancelled = (parseInt(itemsOffsetCancelled) / 10) + 1;
      req.session.maxPageCountCancelled = Math.floor(itemsCountCancelled / 10);
      //Note: check whether equation is correct. previous one is maxPageCount % 10 !== 0
      if (itemsCountCancelled % 10 !== 0) {
        req.session.maxPageCountCancelled++;
      }
      req.session.pageMultipationFactorCancelled = Math.floor((parseInt(itemsOffsetCancelled) / 30));

      req.session.sellingList = null;
      CancelledItemsFinished = true;
    }

    // var sellingList = req.session.sellingList;
    // var remainingTimes = req.session.searchResultRemainingTimeSelling;
    // var filterParamer = req.session.sellpageItemOption;
    //
    // //check whether sellingList session is set
    // if (sellingList === null || sellingList === undefined) {
    //     res.redirect('/api/items/start/' + req.params.start + '/userId/' + user.id);
    // }

    // var itemsOffset = req.session.itemsSellingAccountOffset;
    // var itemsCount = req.session.itemsSellingAccountCount;
    // var currentPageNumber = (parseInt(itemsOffset) / 10) + 1;
    // var maxPageCount = Math.floor(itemsCount / 10);
    // //Note: check whether equation is correct. previous one is maxPageCount % 10 !== 0
    // if (itemsCount % 10 !== 0) {
    //     maxPageCount++;
    // }
    // var pageMultipationFactor = Math.floor((parseInt(itemsOffset) / 30));
    var sellingListOpen = req.session.sellingListOpen;
    var remainingTimesOpen = req.session.remainingTimesOpen;
    var currentPageNumberOpen = req.session.currentPageNumberOpen;
    var maxPageCountOpen = req.session.maxPageCountOpen;
    var pageMultipationFactorOpen = req.session.pageMultipationFactorOpen;

    var sellingListPending = req.session.sellingListPending;
    var remainingTimesPending = req.session.remainingTimesPending;
    var currentPageNumberPending = req.session.currentPageNumberPending;
    var maxPageCountPending = req.session.maxPageCountPending;
    var pageMultipationFactorPending = req.session.pageMultipationFactorPending;

    var sellingListCancelled = req.session.sellingListCancelled;
    var remainingTimesCancelled = req.session.remainingTimesCancelled;
    var currentPageNumberCancelled = req.session.currentPageNumberCancelled;
    var maxPageCountCancelled = req.session.maxPageCountCancelled;
    var pageMultipationFactorCancelled = req.session.pageMultipationFactorCancelled;


    req.session.sellingList = null;
    delete req.session.itemsSellingAccountOffset;
    delete req.session.itemsSellingAccountCount;
    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.notifications;
    delete req.session.messages;

    delete req.session.sellingListOpen;
    delete req.session.remainingTimesOpen;
    delete req.session.currentPageNumberOpen;
    delete req.session.maxPageCountOpen;
    delete req.session.pageMultipationFactorOpen;
    delete req.session.sellingListPending;
    delete req.session.remainingTimesPending;
    delete req.session.currentPageNumberPending;
    delete req.session.maxPageCountPending;
    delete req.session.pageMultipationFactorPending;
    delete req.session.sellingListCancelled;
    delete req.session.remainingTimesCancelled;
    delete req.session.currentPageNumberCancelled;
    delete req.session.maxPageCountCancelled;
    delete req.session.pageMultipationFactorCancelled;
    res.render('useraccountselling', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      sellingListOpen: sellingListOpen[0],
      biddingDetailListOpen: sellingListOpen[1],
      remainingTimesOpen: remainingTimesOpen,
      currentPageNumberOpen: currentPageNumberOpen,
      maxPageCountOpen: maxPageCountOpen,
      pageMultipationFactorOpen: pageMultipationFactorOpen,
      filterParamerOpen: req.query['openDurationOption'],
      sellingListPending: sellingListPending[0],
      biddingDetailListPending: sellingListPending[1],
      remainingTimesPending: remainingTimesPending,
      currentPageNumberPending: currentPageNumberPending,
      maxPageCountPending: maxPageCountPending,
      pageMultipationFactorPending: pageMultipationFactorPending,
      filterParamerPending: req.query['pendingDurationOption'],
      sellingListCancelled: sellingListCancelled[0],
      biddingDetailListCancelled: sellingListCancelled[1],
      remainingTimesCancelled: remainingTimesCancelled,
      currentPageNumberCancelled: currentPageNumberCancelled,
      maxPageCountCancelled: maxPageCountCancelled,
      pageMultipationFactorCancelled: pageMultipationFactorCancelled,
      filterParamerCancelled: req.query['cancelledDurationOption'],
      commodityNames: commodityNames,
      notifications: notifications,
      messages: messages,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path + "?sellingpageItemOption=Open&openDurationOption=1&pendingDurationOption=1&cancelledDurationOption=1";
    res.redirect('/user/login?action=login');
  }
});


//view bidding details of user
router.get('/user/buy/list/start/:start', function (req, res) {
  removeSessionParameters(req);

  // check whether use logged or not
  if (req.isAuthenticated()) {

    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path + '?buyingpageItemOption=Open&openDurationOption=' + req.query['openDurationOption'] + '&pendingDurationOption=' + req.query['pendingDurationOption'] + '&cancelledDurationOption=' + req.query['cancelledDurationOption'];
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    var messages = req.session.messages;
    //check whether notification session is set.
    if (req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/' + req.user.id);
      }
      if (messages === null || messages === undefined) {
        res.redirect('/api/messages/userId/' + req.user.id);
      }
    }

    var user = req.user;
    var OpenBidsFinished = false;
    var PendingBidsFinished = false;
    var CancelledBidsFinished = false;

    if (req.query['buyingpageItemOption'] == 'Open') {
      req.session.buyingListOpen = req.session.buyingList;
      req.session.remainingTimesOpen = req.session.searchResultRemainingTimeBuying;

      //check whether biddinglist session is set
      if (req.session.buyingListOpen === null || req.session.buyingListOpen === undefined) {
        res.redirect('/api/bid/start/' + req.params.start + '/userId/' + user.id + '?buyingpageItemOption=Open&openDurationOption=' + req.query['openDurationOption'] + '&pendingDurationOption=' + req.query['pendingDurationOption'] + '&cancelledDurationOption=' + req.query['cancelledDurationOption']);
      }

      var biddingsOffsetOpen = req.session.itemsBuyingAccountOffset;
      var biddingsCountOpen = req.session.itemsBuyingAccountCount;
      req.session.currentPageNumberOpen = (parseInt(biddingsOffsetOpen) / 10) + 1;
      req.session.maxPageCountOpen = Math.floor(biddingsCountOpen / 10);
      //Note: check whether equation is correct. previous one is maxPageCount % 10 !== 0
      if (biddingsCountOpen % 10 !== 0) {
        req.session.maxPageCountOpen++;
      }
      req.session.pageMultipationFactorOpen = Math.floor((parseInt(biddingsOffsetOpen) / 30));

      req.session.buyingList = null;
      OpenBidsFinished = true;
    }
    if (OpenBidsFinished || req.query['buyingpageItemOption'] == 'Pending') {
      req.session.buyingListPending = req.session.buyingList;
      req.session.remainingTimesPending = req.session.searchResultRemainingTimeBuying;

      //check whether biddinglist session is set
      if (req.session.buyingListPending === null || req.session.buyingListPending === undefined) {
        res.redirect('/api/bid/start/' + req.params.start + '/userId/' + user.id + '?buyingpageItemOption=Pending&openDurationOption=' + req.query['openDurationOption'] + '&pendingDurationOption=' + req.query['pendingDurationOption'] + '&cancelledDurationOption=' + req.query['cancelledDurationOption']);
      }

      var biddingsOffsetPending = req.session.itemsBuyingAccountOffset;
      var biddingsCountPending = req.session.itemsBuyingAccountCount;
      req.session.currentPageNumberPending = (parseInt(biddingsOffsetPending) / 10) + 1;
      req.session.maxPageCountPending = Math.floor(biddingsCountPending / 10);
      //Note: check whether equation is correct. previous one is maxPageCount % 10 !== 0
      if (biddingsCountPending % 10 !== 0) {
        req.session.maxPageCountPending++;
      }
      req.session.pageMultipationFactorPending = Math.floor((parseInt(biddingsOffsetPending) / 30));

      req.session.buyingList = null;
      PendingBidsFinished = true;
    }
    if (PendingBidsFinished || req.query['buyingpageItemOption'] == 'Cancelled') {
      req.session.buyingListCancelled = req.session.buyingList;
      req.session.remainingTimesCancelled = req.session.searchResultRemainingTimeBuying;

      //check whether biddinglist session is set
      if (req.session.buyingListCancelled === null || req.session.buyingListCancelled === undefined) {
        res.redirect('/api/bid/start/' + req.params.start + '/userId/' + user.id + '?buyingpageItemOption=Cancelled&openDurationOption=' + req.query['openDurationOption'] + '&pendingDurationOption=' + req.query['pendingDurationOption'] + '&cancelledDurationOption=' + req.query['cancelledDurationOption']);
      }

      var biddingsOffsetCancelled = req.session.itemsBuyingAccountOffset;
      var biddingsCountCancelled = req.session.itemsBuyingAccountCount;
      req.session.currentPageNumberCancelled = (parseInt(biddingsOffsetCancelled) / 10) + 1;
      req.session.maxPageCountCancelled = Math.floor(biddingsCountCancelled / 10);
      //Note: check whether equation is correct. previous one is maxPageCount % 10 !== 0
      if (biddingsCountCancelled % 10 !== 0) {
        req.session.maxPageCountCancelled++;
      }
      req.session.pageMultipationFactorCancelled = Math.floor((parseInt(biddingsOffsetCancelled) / 30));
    }


    var buyingListOpen = req.session.buyingListOpen;
    var remainingTimesOpen = req.session.remainingTimesOpen;
    var currentPageNumberOpen = req.session.currentPageNumberOpen;
    var maxPageCountOpen = req.session.maxPageCountOpen;
    var pageMultipationFactorOpen = req.session.pageMultipationFactorOpen;

    var buyingListPending = req.session.buyingListPending;
    var remainingTimesPending = req.session.remainingTimesPending;
    var currentPageNumberPending = req.session.currentPageNumberPending;
    var maxPageCountPending = req.session.maxPageCountPending;
    var pageMultipationFactorPending = req.session.pageMultipationFactorPending;

    var buyingListCancelled = req.session.buyingListCancelled;
    var remainingTimesCancelled = req.session.remainingTimesCancelled;
    var currentPageNumberCancelled = req.session.currentPageNumberCancelled;
    var maxPageCountCancelled = req.session.maxPageCountCancelled;
    var pageMultipationFactorCancelled = req.session.pageMultipationFactorCancelled;

    var updateBidMessage = req.session.updateBidMessage;

    req.session.buyingList = null;
    delete req.session.itemsBuyingAccountOffset;
    delete req.session.itemsBuyingAccountCount;
    delete req.session.returnTo;
    delete req.session.notifications;
    delete req.session.messages;

    delete req.session.buyingListOpen;
    delete req.session.remainingTimesOpen;
    delete req.session.currentPageNumberOpen;
    delete req.session.maxPageCountOpen;
    delete req.session.pageMultipationFactorOpen;
    delete req.session.buyingListPending;
    delete req.session.remainingTimesPending;
    delete req.session.currentPageNumberPending;
    delete req.session.maxPageCountPending;
    delete req.session.pageMultipationFactorPending;
    delete req.session.buyingListCancelled;
    delete req.session.remainingTimesCancelled;
    delete req.session.currentPageNumberCancelled;
    delete req.session.maxPageCountCancelled;
    delete req.session.pageMultipationFactorCancelled;
    delete req.session.updateBidMessage;
    res.render('useraccountbuying', {
      //isAuthenticated : req.isAuthenticated(),
      user: user,
      buyingListOpen: buyingListOpen[0],
      itemImagesOpen: buyingListOpen[1],
      lastBidOpen: buyingListOpen[2],
      itemDetailsOpen: buyingListOpen[3],
      remainingTimesOpen: remainingTimesOpen,
      currentPageNumberOpen: currentPageNumberOpen,
      maxPageCountOpen: maxPageCountOpen,
      pageMultipationFactorOpen: pageMultipationFactorOpen,
      filterParamerOpen: req.query['openDurationOption'],
      buyingListPending: buyingListPending[0],
      itemImagesPending: buyingListPending[1],
      lastBidPending: buyingListPending[2],
      itemDetailsPending: buyingListPending[3],
      remainingTimesPending: remainingTimesPending,
      currentPageNumberPending: currentPageNumberPending,
      maxPageCountPending: maxPageCountPending,
      pageMultipationFactorPending: pageMultipationFactorPending,
      filterParamerPending: req.query['pendingDurationOption'],
      buyingListCancelled: buyingListCancelled[0],
      itemImagesCancelled: buyingListCancelled[1],
      lastBidCancelled: buyingListCancelled[2],
      itemDetailsCancelled: buyingListCancelled[3],
      remainingTimesCancelled: remainingTimesCancelled,
      currentPageNumberCancelled: currentPageNumberCancelled,
      maxPageCountCancelled: maxPageCountCancelled,
      pageMultipationFactorCancelled: pageMultipationFactorCancelled,
      filterParamerCancelled: req.query['cancelledDurationOption'],
      commodityNames: commodityNames,
      notifications: notifications,
      messages: messages,
      updateBidMessage: updateBidMessage,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path + "?buyingpageItemOption=Open&openDurationOption=1&pendingDurationOption=1&cancelledDurationOption=1";
    res.redirect('/user/login?action=login');
  }
});


//view biddings for particular item
router.get('/user/sell/bids/start/:start', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  //check whether use logged or not
  if (req.isAuthenticated()) {
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
      res.redirect('/api/bid/start/' + req.params.start + '/itemId/' + itemId);
    }

    //check whether user warehouses are set
    if (userwarehousesSell == null || userwarehousesSell == undefined) {
      res.redirect('/api/user/sell/warehouses/userId/' + user.id + '/itemId/' + itemId);
    }

    //get currency & measure units

    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path + "?itemId=" + itemId;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    var messages = req.session.messages;
    //check whether notification session is set.
    if (req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/' + req.user.id);
      }
      if (messages === null || messages === undefined) {
        res.redirect('/api/messages/userId/' + req.user.id);
      }
    }

    var biddingList = req.session.biddingList[0];
    var bidsCreatedAt = req.session.biddingList[1];

    //pagination
    var biddingOffset = req.session.biddingSellingAccountOffset;
    var biddingCount = req.session.biddingSellingAccountCount;
    var currentPageNumber = (parseInt(biddingOffset) / 10) + 1;
    var maxPageCount = Math.floor(biddingCount / 10);
    //Note: check whether equation is correct. previous one is maxPageCount % 10 !== 0
    if (biddingCount % 10 !== 0) {
      maxPageCount++;
    }
    var pageMultipationFactor = Math.floor((parseInt(biddingOffset) / 30));

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
    delete req.session.messages;
    res.render('viewbiddingdetailsseller', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      item: specificBiddingItemSell,
      itemId: itemId,
      biddingList: biddingList,
      bidsCreatedAt: bidsCreatedAt,
      currentPageNumber: currentPageNumber,
      maxPageCount: maxPageCount,
      pageMultipationFactor: pageMultipationFactor,
      specificBiddingItemSellPriceUnits: specificBiddingItemSellPriceUnits,
      specificBiddingItemSellMeasureUnits: specificBiddingItemSellMeasureUnits,
      userWareHousesSell: userwarehousesSell,
      commodityNames: commodityNames,
      notifications: notifications,
      messages: messages,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login?action=login');
  }
});

//edit detail for particular item
router.get('/user/sell/edit', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  //check whether use logged or not
  if (req.isAuthenticated()) {
    var userwarehousesSell = req.session.bidwarehouses;
    var specificBiddingItemSell = req.session.specificBiddingItemSell;
    var specificBiddingItemSellMeasureUnits = req.session.specificBiddingItemSellMeasureUnits;
    var specificBiddingItemSellPriceUnits = req.session.specificBiddingItemSellPriceUnits;

    //rereive data from reqeuest
    var itemId = req.param('itemId');
    var user = req.user;


    //check whether BiddingItem session is set
    if (specificBiddingItemSell === null || specificBiddingItemSell === undefined) {
      res.redirect('/api/items/sell/id/' + itemId);
    }

    //check whether user warehouses are set
    if (userwarehousesSell == null || userwarehousesSell == undefined) {
      res.redirect('/api/user/sell/warehouses/userId/' + user.id + '/itemId/' + itemId);
    }

    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    var messages = req.session.messages;
    //check whether notification session is set.
    if (req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/' + req.user.id);
      }
      if (messages === null || messages === undefined) {
        res.redirect('/api/messages/userId/' + req.user.id);
      }
    }

    console.log(specificBiddingItemSellPriceUnits);

    req.session.specificBiddingItemSell = null;
    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.specificBiddingItemSellMeasureUnits;
    delete req.session.specificBiddingItemSellPriceUnits;
    delete req.session.notifications;
    delete req.session.messages;
    res.render('edititem', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      item: specificBiddingItemSell,
      itemId: itemId,
      specificBiddingItemSellPriceUnits: specificBiddingItemSellPriceUnits,
      specificBiddingItemSellMeasureUnits: specificBiddingItemSellMeasureUnits,
      userWareHousesSell: userwarehousesSell,
      commodityNames: commodityNames,
      notifications: notifications,
      messages: messages,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login?action=login');
  }
});

//view buyer contract
router.get('/user/buy/contract/id/:id', function (req, res) {
  removeSessionParameters(req);

  // check whether use logged or not
  if (req.isAuthenticated()) {
    var user = req.user;
    var itemId = req.params.id;
    var buyContractItem = req.session.buyContractItem;
    var buyContractBid = req.session.buyContractBid;
    var warehouse = req.session.buyContractWareHouse;
    var contractDate = req.session.contractDate;
    req.session.bidIdContract = req.query['bidId'];

    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path + '?bidId=' + req.session.bidIdContract;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    var messages = req.session.messages;
    //check whether notification session is set.
    if (req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/' + req.user.id);
      }
      if (messages === null || messages === undefined) {
        res.redirect('/api/messages/userId/' + req.user.id);
      }
    }

    //check whether contractedItem session is set
    if (buyContractItem === null || buyContractItem === undefined) {
      res.redirect('/api/items/contract/id/' + itemId);
    }

    //check whether contractBid session is set
    if (buyContractBid === null || buyContractBid === undefined) {
      res.redirect('/api/bid/contract/userId/' + user.id + '/bidId/' + req.session.bidIdContract + '/itemId/' + itemId);
    }

    req.session.buyContractItem = null;
    req.session.buyContractBid = null;
    req.session.contractDate = null;
    delete req.session.returnTo;
    delete req.session.notifications;
    delete req.session.messages;
    delete req.session.bidIdContract;
    delete req.session.buyContractWareHouse;
    res.render('buyercontract', {
      isAuthenticated: req.isAuthenticated(),
      user: user,
      warehouse: warehouse,
      buyContractItem: buyContractItem,
      buyContractBid: buyContractBid,
      commodityNames: commodityNames,
      notifications: notifications,
      messages: messages,
      contractDate: contractDate,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login?action=login');
  }
});

//view seller contract
router.get('/user/sell/contract/bidId/:bidId', function (req, res) {
  removeSessionParameters(req);

  // check whether use logged or not
  if (req.isAuthenticated()) {
    var user = req.user;
    var bidId = req.params.bidId;
    var sellContractItem = req.session.buyContractItem;
    var sellContractBid = req.session.sellContractBid;
    var warehouse = req.session.sellContractWareHouse;
    var contractDate = req.session.contractDate;

    // //check whether contractedItem session is set
    // if (sellContractItem === null || sellContractItem === undefined) {
    //   res.redirect('/api/items/sellcontract/id/'+itemId+'/bidId/'+bidId);
    // }

    //check whether contractBid session is set
    if (sellContractBid === null || sellContractBid === undefined) {
      res.redirect('/api/bid/sellcontract/bidId/' + bidId);
    }

    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    var messages = req.session.messages;
    //check whether notification session is set.
    if (req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/' + req.user.id);
      }
      if (messages === null || messages === undefined) {
        res.redirect('/api/messages/userId/' + req.user.id);
      }
    }

    req.session.buyContractItem = null;
    req.session.sellContractBid = null;
    req.session.contractDate = null;
    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.notifications;
    delete req.session.messages;
    res.render('sellercontract', {
      isAuthenticated: req.isAuthenticated(),
      user: user,
      sellContractItem: sellContractItem,
      sellContractBid: sellContractBid,
      commodityNames: commodityNames,
      notifications: notifications,
      messages: messages,
      contractDate: contractDate,
      warehouse: warehouse,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login?action=login');
  }
});

//view forgot password code page
router.get('/user/forgotpassword', function (req, res) {
  removeSessionParameters(req);

  // check whether use logged or not

  var user = req.user;

  //this will be needed to populate commodity names in top menu
  var commodityNames = req.session.commodityNames
  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path;
  if (commodityNames === null || commodityNames === undefined) {
    res.redirect('/api/commodity/names');
  }

  var notifications = req.session.notifications;
  var messages = req.session.messages;
  //check whether notification session is set.
  if (req.isAuthenticated()) {
    if (notifications === null || notifications === undefined) {
      res.redirect('/api/notification/userId/' + req.user.id);
    }
    if (messages === null || messages === undefined) {
      res.redirect('/api/messages/userId/' + req.user.id);
    }
  }

  delete req.session.returnTo;
  delete req.session.notifications;
  delete req.session.messages;
  res.render('forgotpassword_code', {
    //isAuthenticated : req.isAuthenticated(),
    user: user,
    loginOrRegister: 'Recover Password',
    commodityNames: commodityNames,
    notifications: notifications,
    messages: messages,
    emailError: req.session.recoveryEmailError,
  });

});

//view forgot password code page
router.get('/user/forgotpassword/entercode', function (req, res) {
  removeSessionParameters(req);

  // check whether use logged or not

  var user = req.user;

  //this will be needed to populate commodity names in top menu
  var commodityNames = req.session.commodityNames
  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path;
  if (commodityNames === null || commodityNames === undefined) {
    res.redirect('/api/commodity/names');
  }

  var notifications = req.session.notifications;
  var messages = req.session.messages;
  //check whether notification session is set.
  if (req.isAuthenticated()) {
    if (notifications === null || notifications === undefined) {
      res.redirect('/api/notification/userId/' + req.user.id);
    }
    if (messages === null || messages === undefined) {
      res.redirect('/api/messages/userId/' + req.user.id);
    }
  }

  delete req.session.returnTo;
  delete req.session.notifications;
  delete req.session.messages;
  res.render('forgotpasswordcodeenter', {
    user: user,
    codeError: req.session.codeError,
    recoveryEmail: req.session.recoveryEmail,
    loginOrRegister: 'Enter Code',
    commodityNames: commodityNames,
    notifications: notifications,
    messages: messages,
  });

});


//view item preview
router.get('/items/preview', function (req, res) {
  removeSessionParameters(req);

  // check whether use logged or not
  if (req.isAuthenticated()) {
    var user = req.user;

    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    var messages = req.session.messages;
    //check whether notification session is set.
    if (req.isAuthenticated()) {
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/' + req.user.id);
      }
      if (messages === null || messages === undefined) {
        res.redirect('/api/messages/userId/' + req.user.id);
      }
    }

    var previewImages = req.session.previewImages;

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.notifications;
    delete req.session.messages;
    res.render('itempreview', {
      isAuthenticated: req.isAuthenticated(),
      user: user,
      commodityNames: commodityNames,
      notifications: notifications,
      messages: messages,
      previewImages: previewImages
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    res.redirect('/user/login?action=login');
  }

});

//view forgot password code page
router.get('/user/resetpassword', function (req, res) {
  removeSessionParameters(req);

  // check whether use logged or not

  var user = req.user;

  //this will be needed to populate commodity names in top menu
  var commodityNames = req.session.commodityNames
  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path;
  if (commodityNames === null || commodityNames === undefined) {
    res.redirect('/api/commodity/names');
  }

  var notifications = req.session.notifications;
  var messages = req.session.messages;
  //check whether notification session is set.
  if (req.isAuthenticated()) {
    if (notifications === null || notifications === undefined) {
      res.redirect('/api/notification/userId/' + req.user.id);
    }
    if (messages === null || messages === undefined) {
      res.redirect('/api/messages/userId/' + req.user.id);
    }
  }

  delete req.session.returnTo;
  delete req.session.notifications;
  delete req.session.messages;
  res.render('resetpassword', {
    user: user,
    recoveryEmail: req.session.recoveryEmail,
    loginOrRegister: 'Enter New Password',
    commodityNames: commodityNames,
    notifications: notifications,
    messages: messages,
  });

});


//view message detail page
router.get('/user/messages/id/:id', function (req, res) {

  if (req.isAuthenticated()) {
    removeSessionParameters(req);

    // check whether use logged or not

    var user = req.user;
    var messageDetails = req.session.messageDetails;
    var messageReplies = req.session.messageReplies;

    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      res.redirect('/api/commodity/names');
    }

    var notifications = req.session.notifications;
    var messages = req.session.messages;
    //check whether notification session is set.
    if (req.isAuthenticated()) {
      if (messageDetails === null || messageDetails === undefined) {
        res.redirect('/api/messages/update/id/' + req.params.id);
      }
      if (notifications === null || notifications === undefined) {
        res.redirect('/api/notification/userId/' + req.user.id);
      }
      if (messages === null || messages === undefined) {
        res.redirect('/api/messages/userId/' + req.user.id);
      }
    }

    delete req.session.returnTo;
    delete req.session.notifications;
    delete req.session.messages;
    delete req.session.messageDetails;
    delete req.session.messageReplies;
    res.render('viewmessagedetails', {
      user: user,
      messageDetails: messageDetails,
      commodityNames: commodityNames,
      notifications: notifications,
      messages: messages,
      messageReplies: messageReplies,
    });

  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    req.session.inCorrectLoginPath = req.path;
    res.redirect('/user/login?action=login');
  }
});

//view inbox page
router.get('/user/inbox', function (req, res) {
  removeSessionParameters(req);

  // check whether use logged or not

  var user = req.user;
  var inboxMessages = req.session.inboxMessages;

  //this will be needed to populate commodity names in top menu
  var commodityNames = req.session.commodityNames;
  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path;
  if (commodityNames === null || commodityNames === undefined) {
    res.redirect('/api/commodity/names');
  }

  var notifications = req.session.notifications;
  var messages = req.session.messages;
  //check whether notification session is set.
  if (req.isAuthenticated()) {
    if (inboxMessages === null || inboxMessages === undefined) {
      res.redirect('/api/messages/inbox/userId/' + user.id);
    }
    if (notifications === null || notifications === undefined) {
      res.redirect('/api/notification/userId/' + req.user.id);
    }
    if (messages === null || messages === undefined) {
      res.redirect('/api/messages/userId/' + req.user.id);
    }
  }

  delete req.session.returnTo;
  delete req.session.notifications;
  delete req.session.messages;
  delete req.session.inboxMessages;
  res.render('viewmessagesinbox', {
    user: user,
    inboxMessages: inboxMessages,
    commodityNames: commodityNames,
    notifications: notifications,
    messages: messages,
  });
});

//view sentbox page
router.get('/user/sent', function (req, res) {
  removeSessionParameters(req);

  // check whether use logged or not

  var user = req.user;
  var sentMessages = req.session.sentMessages;

  //this will be needed to populate commodity names in top menu
  var commodityNames = req.session.commodityNames;
  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path;
  if (commodityNames === null || commodityNames === undefined) {
    res.redirect('/api/commodity/names');
  }

  var notifications = req.session.notifications;
  var messages = req.session.messages;
  //check whether notification session is set.
  if (req.isAuthenticated()) {
    if (sentMessages === null || sentMessages === undefined) {
      res.redirect('/api/messages/sent/userId/' + user.id);
    }
    if (notifications === null || notifications === undefined) {
      res.redirect('/api/notification/userId/' + req.user.id);
    }
    if (messages === null || messages === undefined) {
      res.redirect('/api/messages/userId/' + req.user.id);
    }
  }

  delete req.session.returnTo;
  delete req.session.notifications;
  delete req.session.messages;
  delete req.session.sentMessages;
  res.render('viewmessagessent', {
    user: user,
    sentMessages: sentMessages,
    commodityNames: commodityNames,
    notifications: notifications,
    messages: messages,
  });
});

//to remove unnecessary session parameters
function removeSessionParameters(req) {
  delete req.session.selectedClass;
  delete req.session.selectedSegment;
  delete req.session.selectedLocation;
  delete req.session.keyword;
  delete req.session.startPrice;
  delete req.session.endPrice;
}

//remove unnecessary session parameters when created at user selling page, when switching to other routes
function removeSessionParameterSellingPage(req) {
  delete req.session.sellpageItemOption;
}
module.exports = router;
