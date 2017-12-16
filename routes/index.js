let express = require('express');
let _ = require('lodash');
let router = express.Router();
let CommodityController = require('../controller/commodity');
let async = require('async');


//view home page
router.get('/', function (req, res) {
  removeSessionParameterSellingPage(req);
  removeSessionParameters(req);

  if (req.session.language === null || req.session.language === undefined) {
    req.session.language = "english";
  }

  //retrieve required data from session
  let commodityPopular = req.session.commodityPopular;
  let commodityNames = req.session.commodityNames;
  let latestItems = req.session.latestItems;
  let bestsellers = req.session.bestsellers;
  let recentsearches = req.session.recentsearches;
  let neartocloseItems = req.session.neartocloseItems;
  let latestNews = req.session.latestNews;

  //check whether commodityPopular session is set
  if (commodityPopular === null || commodityPopular === undefined) {
    return res.redirect('/api/commodity/viewpopular');
  }

  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path;
  if (commodityNames === null || commodityNames === undefined) {
    return res.redirect('/api/commodity/names');
  }

  if (req.user != null && req.user != undefined) {
    //check whether Near to bidding close items session is set
    if (recentsearches === null || recentsearches === undefined) {
      return res.redirect('/api/recentsearch/userId/' + req.user.id);
    }
  } else {
    //check whether Near to bidding close items session is set
    if (recentsearches === null || recentsearches === undefined) {
      return res.redirect('/api/recentsearch/userId/' + null);
    }
  }

  //load recent seraches
  if (latestNews === null || latestNews === undefined) {
    return res.redirect('/api/news/viewlatest');
  }
  //check whether latest items session is set
  if (latestItems === null || latestItems === undefined) {
    return res.redirect('/api/items/viewlatest');
  }

  console.log('Index Page Visited');

  delete req.session.returnTo;
  delete req.session.returnToCommodityName;
  delete req.session.commodityPopular;
  delete req.session.latestItems;
  delete req.session.bestsellers;
  delete req.session.neartocloseItems;
  delete req.session.recentsearches;
  return res.render('index', {
    commodityNames: commodityNames,
    latestItems: latestItems,
    commodityPopular: commodityPopular,
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
    let commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      return res.redirect('/api/commodity/names');
    }

    let families = req.session.families;
    if (families === null || families === undefined) {
      return res.redirect('/api/commodity/families?add=true');
    }

    let newsTitles = req.session.newsTitles;
    if (newsTitles === null || newsTitles === undefined) {
      return res.redirect('/api/news/titles');
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.families;
    delete req.session.newsTitles;
    return res.render('addnews', {
      commodityNames: commodityNames,
      user: req.user,
      families: families,
      newsTitles: newsTitles,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    return res.redirect('/user/login?action=login');
  }
});

/* GET view first news page. */
router.get('/news/start/:start', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);
  let newsAll = req.session.newsall;
  let newsOffset = req.session.newsOffset;
  let newsCount = req.session.newsCount;
  let currentPageNumber = (parseInt(newsOffset) / 3) + 1;
  let maxPageCount = Math.floor(newsCount / 3);
  //Note: check whether equation is correct. previous one is maxPageCount % 10 !== 0
  if (newsCount % 3 !== 0) {
    maxPageCount++;
  }
  let pageMultipationFactor = Math.floor((parseInt(newsOffset) / 9));

  //check whether newsAll session is set
  if (newsAll === null || newsAll === undefined) {
    return res.redirect('/api/news/start/' + req.params.start + '?category=' + req.query['category'] + '&keyword=' + req.query['keyword']);
  }

  //this will be needed to populate commodity names in top menu
  let commodityNames = req.session.commodityNames;
  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path + '?category=' + req.query['category'] + '&keyword=' + req.query['keyword'];
  if (commodityNames === null || commodityNames === undefined) {
    return res.redirect('/api/commodity/names');
  }

  req.session.newsall = null;
  req.session.newsOffset = null;
  req.session.newsCount = null;
  delete req.session.returnToCommodityName;
  return res.render('viewnewsall', {
    News: newsAll,
    currentPageNumber: currentPageNumber,
    maxPageCount: maxPageCount,
    pageMultipationFactor: pageMultipationFactor,
    commodityNames: commodityNames,
    URLkeyword: req.query['keyword'],
    URLcategory: req.query['category'],
    user: req.user,
  });
});

/* GET view single news page*/
router.get('/news/id/:id', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);
  let news = req.session.specificNews;

  //check whether newsAll session is set
  if (news === null || news === undefined) {
    return res.redirect('/api/news/id/' + req.params.id + '?lan=' + req.query['lan']);
  }

  //this will be needed to populate commodity names in top menu
  let commodityNames = req.session.commodityNames;
  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path + '?lan=' + req.query['lan'];
  if (commodityNames === null || commodityNames === undefined) {
    return res.redirect('/api/commodity/names');
  }

  req.session.specificNews = null;
  delete req.session.returnToCommodityName;
  return res.render('viewnews', {
    News: news,
    commodityNames: commodityNames,
    user: req.user,
  });
});


//view basic details
router.get('/user/basic', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  //check whether use logged or not
  let errorMessage = req.session.errorMessage || '';
  delete req.session.errorMessage;
  if (req.isAuthenticated()) {
    //this will be needed to populate commodity names in top menu
    let commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      return res.redirect('/api/commodity/names');
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.notifications;
    delete req.session.messages;
    return res.render('useraccountbasics', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      errorMessage: errorMessage,
      commodityNames: commodityNames,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    return res.redirect('/user/login?action=login');
  }
});


//view contact details
router.get('/user/contact', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  //check whether use logged or not
  let errorMessage = req.session.errorMessage || '';

  if (req.isAuthenticated()) {
    //this will be needed to populate commodity names in top menu
    let commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      return res.redirect('/api/commodity/names');
    }

    let userContactInformation = req.session.userContactInformation;
    //retreive user contact information
    if (req.isAuthenticated()) {
      req.session.redirectContactInforPath = req.path;
      if (userContactInformation === null || userContactInformation === undefined) {
        return res.redirect('/api/user/contactinfo/userId/' + req.user.id);
      }
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.errorMessage;
    delete req.session.userContactInformation;
    delete req.session.redirectContactInforPath;
    return res.render('useraccountcontactinformation', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      errorMessage: errorMessage,
      commodityNames: commodityNames,
      userContactInformation: userContactInformation,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    return res.redirect('/user/login?action=login');
  }
});

//view user business details
router.get('/user/business', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  //check whether use logged or not
  let errorMessage = req.session.errorMessage || '';
  delete req.session.errorMessage;
  if (req.isAuthenticated()) {
    //this will be needed to populate commodity names in top menu
    let commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      return res.redirect('/api/commodity/names');
    }

    let userTradingBusinessInformation = req.session.userTradingBusinessInformation;
    //check whether notification session is set.
    if (req.isAuthenticated()) {
      if (userTradingBusinessInformation === null || userTradingBusinessInformation === undefined) {
        return res.redirect('/api/user/businessinfo/userId/' + req.user.id);
      }
    }

    let userCertificateInformation = req.session.userCertificateInformation;
    //check whether notification session is set.
    if (req.isAuthenticated()) {
      if (userCertificateInformation === null || userCertificateInformation === undefined) {
        return res.redirect('/api/user/certificateinfo/userId/' + req.user.id);
      }
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.userCertificateInformation;
    delete req.session.userTradingBusinessInformation;
    res.render('userbusinessinformation', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      errorMessage: errorMessage,
      commodityNames: commodityNames,
      userTradingBusinessInformation: userTradingBusinessInformation,
      userCertificateInformation: userCertificateInformation,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    return res.redirect('/user/login?action=login');
  }
});

//view user payment details
router.get('/user/payment', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  //check whether use logged or not
  let errorMessage = req.session.errorMessage || '';
  delete req.session.errorMessage;
  if (req.isAuthenticated()) {
    //this will be needed to populate commodity names in top menu
    let commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      return res.redirect('/api/commodity/names');
    }

    let userPaymentInformation = req.session.userPaymentInformation;
    //retreive user payment information
    if (req.isAuthenticated()) {
      if (userPaymentInformation === null || userPaymentInformation === undefined) {
        return res.redirect('/api/user/paymentinfo/userId/' + req.user.id);
      }
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.userPaymentInformation;
    res.render('userpaymentinformation', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      errorMessage: errorMessage,
      commodityNames: commodityNames,
      userPaymentInformation: userPaymentInformation,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    return res.redirect('/user/login?action=login');
  }
});


//view user notification details
router.get('/user/notification', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  //check whether use logged or not
  let errorMessage = req.session.errorMessage || '';
  delete req.session.errorMessage;
  if (req.isAuthenticated()) {
    //this will be needed to populate commodity names in top menu
    let commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      return res.redirect('/api/commodity/names');
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    res.render('usernotificationpreference', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      errorMessage: errorMessage,
      commodityNames: commodityNames,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    return res.redirect('/user/login?action=login');
  }
});

//view user payment details
router.get('/user/public/userId/:userId', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  //check whether use logged or not
  let errorMessage = req.session.errorMessage || '';
  delete req.session.errorMessage;
  if (req.isAuthenticated()) {
    //this will be needed to populate commodity names in top menu
    let commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      return res.redirect('/api/commodity/names');
    }

    //retrieve user's public details
    let userPublicInformation = req.session.userPublicInformation;
    let userPublicComments = req.session.userPublicComments;
    let userPublicCurrentListing = req.session.userPublicCurrentListing;
    if (userPublicInformation === null || userPublicInformation === undefined) {
      return res.redirect('/api/user/public/userId/' + req.params.userId);
    }


    let userContactInformation = req.session.userContactInformation;
    //retreive user contact information
    if (req.isAuthenticated()) {
      req.session.redirectContactInforPath = req.path;
      if (userContactInformation === null || userContactInformation === undefined) {
        return res.redirect('/api/user/contactinfo/userId/' + req.user.id);
      }
    }

    let biddingCountUserProfile = req.session.biddingCountUserProfile;
    //retreive user contact information
    if (req.isAuthenticated()) {
      if (biddingCountUserProfile === null || biddingCountUserProfile === undefined) {
        return res.redirect('/api/bid/userId/' + req.user.id + '/itemUserId/' + req.params.userId);
      }
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.userPublicInformation;
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
      userPublicInformation: userPublicInformation,
      userContactInformation: userContactInformation,
      biddingCountUserProfile: biddingCountUserProfile,
      userPublicComments: userPublicComments,
      userPublicCurrentListing: userPublicCurrentListing,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    return res.redirect('/user/login?action=login');
  }
});

//add commodity details
router.get('/commodity/add', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  //this will be needed to populate commodity names in top menu
  let commodityNames = req.session.commodityNames;
  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path;
  if (commodityNames === null || commodityNames === undefined) {
    return res.redirect('/api/commodity/names');
  }

  delete req.session.returnToCommodityName;
  delete req.session.notifications;
  delete req.session.messages;
  res.render('addcommodity', {
    commodityNames: commodityNames,
    user: req.user,
  });

});

/* GET view search commodity page for item add*/
router.get('/items/search', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  if (req.isAuthenticated()) {

    let recentSearches = req.session.recentSearches;
    if (recentSearches === null || recentSearches === undefined) {
      return res.redirect('/api/commodity/recentsearch/userId/' + req.user.id);
    }

    //this will be needed to populate commodity names in top menu
    let commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      return res.redirect('/api/commodity/names');
    }

    let commodities = req.session.commodities;
    //check whether commodities session is set
    if (commodities === null || commodities === undefined) {
      return res.redirect('/api/commodity/viewall');
    }

    req.session.commodities = null;
    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.recentSearches;
    res.render('searchcommodityadd', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      Commodities: commodities.rows,
      commodityNames: commodityNames,
      recentSearches: recentSearches,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    return res.redirect('/user/login?action=login');
  }
});

/* GET view search results page*/
router.get('/items', function (req, res) {
  removeSessionParameterSellingPage(req);
  let searchResult = req.session.searchResult;
  let searchResultRemainingTime = req.session.searchResultRemainingTime;
  let maxPrice = (req.session.maxPrice != undefined && req.session.maxPrice != null) ? req.session.maxPrice.split(" ")[1] : 10000;
  let distinctCharacteristics = req.session.distinctCharacteristics;
  let selectedClass = req.session.selectedClass;
  let selectedSegment = req.session.selectedSegment;
  let selectedLocation = req.session.selectedLocation;
  let keyword = req.session.keyword;
  let startPrice = req.session.startPrice ? req.session.startPrice : 0;
  let endPrice = req.session.endPrice ? req.session.endPrice : maxPrice;

  //this will be needed to populate commodity names in top menu
  let commodityNames = req.session.commodityNames;
  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path;
  if (commodityNames === null || commodityNames === undefined) {
    return res.redirect('/api/commodity/names');
  }

  let itemsOffset = req.session.itemsOffset;
  let itemsCount = req.session.itemsCount;
  let currentPageNumber = (parseInt(itemsOffset) / 10) + 1;
  let maxPageCount = Math.floor(itemsCount / 10);
  //Note: check whether equation is correct. previous one is maxPageCount % 10 !== 0
  if (itemsCount % 10 !== 0) {
    maxPageCount++;
  }
  let pageMultipationFactor = Math.floor((parseInt(itemsOffset) / 30));

  delete req.session.returnToCommodityName;
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
    user: req.user,
  });

});

/* GET view search commodity page for item add*/
router.get('/items/add/commoditydetails', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  if (req.isAuthenticated()) {
    let commodity = req.session.commodity;

    //this will be needed to populate commodity names in top menu
    let commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      return res.redirect('/api/commodity/names');
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    res.render('commoditydetailsadd', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      Commodity: commodity,
      CommodityAlterNames: commodity.CommodityAlterNames,
      CommodityImages: commodity.CommodityImages,
      CommodityParameters: commodity.CommodityParameters,
      commodityNames: commodityNames,
      CommodityMeasureUnits: commodity.CommodityMeasureUnits,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    return res.redirect('/user/login?action=login');
  }

});

/* GET view item add page*/
router.get('/items/add', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  if (req.isAuthenticated()) {
    let commodityId = req.query['id'];
    if (commodityId !== null && commodityId !== undefined) {
      req.session.commodityId = commodityId;
    }
    let warehouses = req.session.warehouses;
    let measureUnits = req.session.measureUnits;
    let priceUnits = req.session.priceUnits;
    let packingTypes = req.session.packingTypes;
    let commodityName = req.session.commodityName;

    //check whether warehouses session is set
    if (warehouses === null || warehouses === undefined) {
      return res.redirect('/api/user/view/warehouses/userId/' + req.user.id);
    }

    //check whether commodityMeasurements session is set
    if (measureUnits === null || measureUnits === undefined) {
      return res.redirect('/api/commodity/measureUnits/id/' + req.session.commodityId);
    }

    //check whether commodityName session is set
    if (commodityName === null || commodityName === undefined) {
      return res.redirect('/api/commodity/commodityName/id/' + req.session.commodityId);
    }

    //this will be needed to populate commodity names in top menu
    let commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      return res.redirect('/api/commodity/names');
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.priceUnits;
    delete req.session.measureUnits;
    delete req.session.packingTypes;
    delete req.session.warehouses;
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
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    return res.redirect('/user/login?action=login');
  }
});

/* GET view item add page*/
router.get('/items/add', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  if (req.isAuthenticated()) {
    let commodityId = req.query['id'];
    if (commodityId !== null && commodityId !== undefined) {
      req.session.commodityId = commodityId;
    }
    let warehouses = req.session.warehouses;
    let measureUnits = req.session.measureUnits;
    let priceUnits = req.session.priceUnits;

    //check whether warehouses session is set
    if (warehouses === null || warehouses === undefined) {
      return res.redirect('/api/user/view/warehouses/userId/' + req.user.id);
    }

    //check whether commodityMeasurements session is set
    if (measureUnits === null || measureUnits === undefined) {
      return res.redirect('/api/commodity/measureUnits/id/' + req.session.commodityId);
    }

    //this will be needed to populate commodity names in top menu
    let commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      return res.redirect('/api/commodity/names');
    }

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    delete req.session.priceUnits;
    delete req.session.measureUnits;
    delete req.session.warehouses;
    res.render('additem', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      CommodityId: req.session.commodityId,
      WareHouses: warehouses,
      measureUnits: measureUnits,
      priceUnits: priceUnits,
      commodityNames: commodityNames,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    return res.redirect('/user/login?action=login');
  }
});

router.get('/items/name/:name', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);
  // if (req.isAuthenticated()) {
  let item = req.session.specificBiddingItem;
  let user = req.user;
  let measureUnits = req.session.measureUnits;

  //check whether item is retrieved from database
  if (item === null || item === undefined) {
    let url = '/api/items/name/' + req.params.name;
    if (user) {
      url += '?userId=' + String(user.id);
    }
    return res.redirect(url);
  }

  //this will be needed to populate commodity names in top menu
  let commodityNames = req.session.commodityNames;
  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path;
  if (commodityNames === null || commodityNames === undefined) {
    return res.redirect('/api/commodity/names');
  }

  let otherFunctions = require('./items').otherFunc;
  otherFunctions.getCommodityPriceUnit(item.item.id, function (cpu) {
    otherFunctions.getCommodityMeasureUnit(item.item.id, function (cmu) {
      otherFunctions.getCommodityPackageType(item.item.id, function (cpt) {
        let previousData = req.session.listingPageDetails;

        req.session.lastBid = null;
        req.session.lastUserBid = null;
        req.session.specificBiddingItem = null;
        delete req.session.returnTo;
        delete req.session.returnToCommodityName;
        delete req.session.bidAddMessage;
        delete req.session.bidpageUserFeedback;
        delete req.session.listingPageDetails;
        delete req.session.measureUnits;

        res.render('bidpage', {
          isAuthenticated: req.isAuthenticated(),
          user: req.user || {},
          item: item,
          itemComments: item.itemComments,
          commodityNames: commodityNames,
          measureUnits: cmu,
          previousData: previousData
        });
      });
    });
  });
});

//view selling details of user
router.get('/user/sell/list/start/:start', function (req, res) {
  removeSessionParameters(req);

  // check whether use logged or not
  if (req.isAuthenticated()) {

    //this will be needed to populate commodity names in top menu
    let commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path + '?sellingpageItemOption=Open&openDurationOption=' + req.query['openDurationOption'] + '&pendingDurationOption=' + req.query['pendingDurationOption'] + '&cancelledDurationOption=' + req.query['cancelledDurationOption'];
    if (commodityNames === null || commodityNames === undefined) {
      return res.redirect('/api/commodity/names');
    }

    let user = req.user;
    let OpenItemsFinished = false;
    let PendingItemsFinished = false;
    let CancelledItemsFinished = false;

    if (req.query['sellingpageItemOption'] == 'Open') {
      req.session.sellingListOpen = req.session.sellingList;
      console.log(req.session.sellingListOpen);
      req.session.remainingTimesOpen = req.session.searchResultRemainingTimeSelling;

      //check whether itemlist session is set
      if (req.session.sellingListOpen === null || req.session.sellingListOpen === undefined) {
        return res.redirect('/api/items/start/' + req.params.start + '/userId/' + user.id + '?sellingpageItemOption=Open&openDurationOption=' + req.query['openDurationOption'] + '&pendingDurationOption=' + req.query['pendingDurationOption'] + '&cancelledDurationOption=' + req.query['cancelledDurationOption']);
      }

      let itemsOffsetOpen = req.session.itemsSellingAccountOffset;
      let itemsCountOpen = req.session.itemsSellingAccountCount;
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
        return res.redirect('/api/items/start/' + req.params.start + '/userId/' + user.id + '?sellingpageItemOption=Pending&openDurationOption=' + req.query['openDurationOption'] + '&pendingDurationOption=' + req.query['pendingDurationOption'] + '&cancelledDurationOption=' + req.query['cancelledDurationOption']);
      }


      let itemsOffsetPending = req.session.itemsSellingAccountOffset;
      let itemsCountPending = req.session.itemsSellingAccountCount;
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
        return res.redirect('/api/items/start/' + req.params.start + '/userId/' + user.id + '?sellingpageItemOption=Cancelled&openDurationOption=' + req.query['openDurationOption'] + '&pendingDurationOption=' + req.query['pendingDurationOption'] + '&cancelledDurationOption=' + req.query['cancelledDurationOption']);
      }

      let itemsOffsetCancelled = req.session.itemsSellingAccountOffset;
      let itemsCountCancelled = req.session.itemsSellingAccountCount;
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

    let sellingListOpen = req.session.sellingListOpen;
    let remainingTimesOpen = req.session.remainingTimesOpen;
    let currentPageNumberOpen = req.session.currentPageNumberOpen;
    let maxPageCountOpen = req.session.maxPageCountOpen;
    let pageMultipationFactorOpen = req.session.pageMultipationFactorOpen;

    let sellingListPending = req.session.sellingListPending;
    let remainingTimesPending = req.session.remainingTimesPending;
    let currentPageNumberPending = req.session.currentPageNumberPending;
    let maxPageCountPending = req.session.maxPageCountPending;
    let pageMultipationFactorPending = req.session.pageMultipationFactorPending;

    let sellingListCancelled = req.session.sellingListCancelled;
    let remainingTimesCancelled = req.session.remainingTimesCancelled;
    let currentPageNumberCancelled = req.session.currentPageNumberCancelled;
    let maxPageCountCancelled = req.session.maxPageCountCancelled;
    let pageMultipationFactorCancelled = req.session.pageMultipationFactorCancelled;


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
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path + "?sellingpageItemOption=Open&openDurationOption=1&pendingDurationOption=1&cancelledDurationOption=1";
    return res.redirect('/user/login?action=login');
  }
});

//view bidding details of user
router.get('/user/buy/list/start/:start', function (req, res) {
  removeSessionParameters(req);

  // check whether use logged or not
  if (req.isAuthenticated()) {

    //this will be needed to populate commodity names in top menu
    let commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path + '?buyingpageItemOption=Open&openDurationOption=' + req.query['openDurationOption'] + '&pendingDurationOption=' + req.query['pendingDurationOption'] + '&cancelledDurationOption=' + req.query['cancelledDurationOption'];
    if (commodityNames === null || commodityNames === undefined) {
      return res.redirect('/api/commodity/names');
    }

    let user = req.user;
    let OpenBidsFinished = false;
    let PendingBidsFinished = false;
    let CancelledBidsFinished = false;

    if (req.query['buyingpageItemOption'] == 'Open') {
      req.session.buyingListOpen = req.session.buyingList;
      req.session.remainingTimesOpen = req.session.searchResultRemainingTimeBuying;

      //check whether biddinglist session is set
      if (req.session.buyingListOpen === null || req.session.buyingListOpen === undefined) {
        return res.redirect('/api/bid/start/' + req.params.start + '/userId/' + user.id + '?buyingpageItemOption=Open&openDurationOption=' + req.query['openDurationOption'] + '&pendingDurationOption=' + req.query['pendingDurationOption'] + '&cancelledDurationOption=' + req.query['cancelledDurationOption']);
      }

      let biddingsOffsetOpen = req.session.itemsBuyingAccountOffset;
      let biddingsCountOpen = req.session.itemsBuyingAccountCount;
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
        return res.redirect('/api/bid/start/' + req.params.start + '/userId/' + user.id + '?buyingpageItemOption=Pending&openDurationOption=' + req.query['openDurationOption'] + '&pendingDurationOption=' + req.query['pendingDurationOption'] + '&cancelledDurationOption=' + req.query['cancelledDurationOption']);
      }

      let biddingsOffsetPending = req.session.itemsBuyingAccountOffset;
      let biddingsCountPending = req.session.itemsBuyingAccountCount;
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
        return res.redirect('/api/bid/start/' + req.params.start + '/userId/' + user.id + '?buyingpageItemOption=Cancelled&openDurationOption=' + req.query['openDurationOption'] + '&pendingDurationOption=' + req.query['pendingDurationOption'] + '&cancelledDurationOption=' + req.query['cancelledDurationOption']);
      }

      let biddingsOffsetCancelled = req.session.itemsBuyingAccountOffset;
      let biddingsCountCancelled = req.session.itemsBuyingAccountCount;
      req.session.currentPageNumberCancelled = (parseInt(biddingsOffsetCancelled) / 10) + 1;
      req.session.maxPageCountCancelled = Math.floor(biddingsCountCancelled / 10);
      //Note: check whether equation is correct. previous one is maxPageCount % 10 !== 0
      if (biddingsCountCancelled % 10 !== 0) {
        req.session.maxPageCountCancelled++;
      }
      req.session.pageMultipationFactorCancelled = Math.floor((parseInt(biddingsOffsetCancelled) / 30));
    }


    let buyingListOpen = req.session.buyingListOpen;
    let remainingTimesOpen = req.session.remainingTimesOpen;
    let currentPageNumberOpen = req.session.currentPageNumberOpen;
    let maxPageCountOpen = req.session.maxPageCountOpen;
    let pageMultipationFactorOpen = req.session.pageMultipationFactorOpen;

    let buyingListPending = req.session.buyingListPending;
    let remainingTimesPending = req.session.remainingTimesPending;
    let currentPageNumberPending = req.session.currentPageNumberPending;
    let maxPageCountPending = req.session.maxPageCountPending;
    let pageMultipationFactorPending = req.session.pageMultipationFactorPending;

    let buyingListCancelled = req.session.buyingListCancelled;
    let remainingTimesCancelled = req.session.remainingTimesCancelled;
    let currentPageNumberCancelled = req.session.currentPageNumberCancelled;
    let maxPageCountCancelled = req.session.maxPageCountCancelled;
    let pageMultipationFactorCancelled = req.session.pageMultipationFactorCancelled;

    let updateBidMessage = req.session.updateBidMessage;

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
      updateBidMessage: updateBidMessage,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path + "?buyingpageItemOption=Open&openDurationOption=1&pendingDurationOption=1&cancelledDurationOption=1";
    return res.redirect('/user/login?action=login');
  }
});

//view biddings for particular item
router.get('/user/sell/bids/start/:start', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  //check whether use logged or not
  if (req.isAuthenticated()) {
    let biddingDetails = req.session.biddingList;
    let userwarehousesSell = req.session.bidwarehouses;
    let specificBiddingItemSell = req.session.specificBiddingItemSell;
    let specificBiddingItemSellMeasureUnits = req.session.specificBiddingItemSellMeasureUnits;
    let specificBiddingItemSellPriceUnits = req.session.specificBiddingItemSellPriceUnits;

    //rereive data from reqeuest
    let itemId = req.param('itemId');
    let user = req.user;


    //check whether biddingList session is set
    if (biddingDetails === null || biddingDetails === undefined) {
      return res.redirect('/api/bid/start/' + req.params.start + '/itemId/' + itemId);
    }

    //check whether user warehouses are set
    if (userwarehousesSell == null || userwarehousesSell == undefined) {
      return res.redirect('/api/user/sell/warehouses/userId/' + user.id + '/itemId/' + itemId);
    }

    //get currency & measure units

    //this will be needed to populate commodity names in top menu
    let commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path + "?itemId=" + itemId;
    if (commodityNames === null || commodityNames === undefined) {
      return res.redirect('/api/commodity/names');
    }


    let biddingList = req.session.biddingList[0];
    let bidsCreatedAt = req.session.biddingList[1];

    //pagination
    let biddingOffset = req.session.biddingSellingAccountOffset;
    let biddingCount = req.session.biddingSellingAccountCount;
    let currentPageNumber = (parseInt(biddingOffset) / 10) + 1;
    let maxPageCount = Math.floor(biddingCount / 10);
    //Note: check whether equation is correct. previous one is maxPageCount % 10 !== 0
    if (biddingCount % 10 !== 0) {
      maxPageCount++;
    }
    let pageMultipationFactor = Math.floor((parseInt(biddingOffset) / 30));

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
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    return res.redirect('/user/login?action=login');
  }
});

//edit detail for particular item
router.get('/items/edit/:itemId', function (req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);
  let otherFunctions = require('./items').otherFunc;
  //check whether use logged or not
  if (req.isAuthenticated()) {

    otherFunctions.getItemById(req.params['itemId'], function (item) {
      otherFunctions.getCommodityMeasureUnit(item.CommodityId, function (cmu) {
        otherFunctions.getCommodityPriceUnit(item.CommodityId, function (cpu) {
          otherFunctions.getCommodityPackageType(item.CommodityId, function (cp) {
            res.render('edititem', {
              isAuthenticated: req.isAuthenticated(),
              user: req.user,
              item: item,
              packingType: cp,
              measureUnits: cmu,
              priceUnits: cpu
            });
            // res.jsonp(item);
          });
        });
      });
    });

  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    return res.redirect('/user/login?action=login');
  }
});

//view buyer contract
router.get('/user/buy/contract/id/:id', function (req, res) {
  removeSessionParameters(req);

  // check whether use logged or not
  if (req.isAuthenticated()) {
    let user = req.user;
    let itemId = req.params.id;
    let buyContractItem = req.session.buyContractItem;
    let buyContractBid = req.session.buyContractBid;
    let warehouse = req.session.buyContractWareHouse;
    let contractDate = req.session.contractDate;
    req.session.bidIdContract = req.query['bidId'];

    //this will be needed to populate commodity names in top menu
    let commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path + '?bidId=' + req.session.bidIdContract;
    if (commodityNames === null || commodityNames === undefined) {
      return res.redirect('/api/commodity/names');
    }

    //check whether contractedItem session is set
    if (buyContractItem === null || buyContractItem === undefined) {
      return res.redirect('/api/items/contract/id/' + itemId);
    }

    //check whether contractBid session is set
    if (buyContractBid === null || buyContractBid === undefined) {
      return res.redirect('/api/bid/contract/userId/' + user.id + '/bidId/' + req.session.bidIdContract + '/itemId/' + itemId);
    }

    req.session.buyContractItem = null;
    req.session.buyContractBid = null;
    req.session.contractDate = null;
    delete req.session.returnTo;
    delete req.session.bidIdContract;
    delete req.session.buyContractWareHouse;
    res.render('buyercontract', {
      isAuthenticated: req.isAuthenticated(),
      user: user,
      warehouse: warehouse,
      buyContractItem: buyContractItem,
      buyContractBid: buyContractBid,
      commodityNames: commodityNames,
      contractDate: contractDate,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    return res.redirect('/user/login?action=login');
  }
});

//view seller contract
router.get('/user/sell/contract/bidId/:bidId', function (req, res) {
  removeSessionParameters(req);

  // check whether use logged or not
  if (req.isAuthenticated()) {
    let user = req.user;
    let bidId = req.params.bidId;
    let sellContractItem = req.session.buyContractItem;
    let sellContractBid = req.session.sellContractBid;
    let warehouse = req.session.sellContractWareHouse;
    let contractDate = req.session.contractDate;

    //check whether contractBid session is set
    if (sellContractBid === null || sellContractBid === undefined) {
      return res.redirect('/api/bid/sellcontract/bidId/' + bidId);
    }

    //this will be needed to populate commodity names in top menu
    let commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      return res.redirect('/api/commodity/names');
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
      contractDate: contractDate,
      warehouse: warehouse,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    return res.redirect('/user/login?action=login');
  }
});

//view forgot password code page
router.get('/user/forgotpassword', function (req, res) {
  removeSessionParameters(req);

  // check whether use logged or not

  let user = req.user;

  //this will be needed to populate commodity names in top menu
  let commodityNames = req.session.commodityNames;
  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path;
  if (commodityNames === null || commodityNames === undefined) {
    return res.redirect('/api/commodity/names');
  }

  delete req.session.returnTo;
  delete req.session.notifications;
  delete req.session.messages;
  res.render('forgotpassword_code', {
    //isAuthenticated : req.isAuthenticated(),
    user: user,
    loginOrRegister: 'Recover Password',
    commodityNames: commodityNames,
    emailError: req.session.recoveryEmailError,
  });

});

//view forgot password code page
router.get('/user/forgotpassword/entercode', function (req, res) {
  removeSessionParameters(req);

  // check whether use logged or not

  let user = req.user;

  //this will be needed to populate commodity names in top menu
  let commodityNames = req.session.commodityNames;
  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path;
  if (commodityNames === null || commodityNames === undefined) {
    return res.redirect('/api/commodity/names');
  }

  delete req.session.returnTo;
  res.render('forgotpasswordcodeenter', {
    user: user,
    codeError: req.session.codeError,
    recoveryEmail: req.session.recoveryEmail,
    loginOrRegister: 'Enter Code',
    commodityNames: commodityNames,
  });

});

//view item preview
router.get('/items/preview', function (req, res) {
  removeSessionParameters(req);

  // check whether use logged or not
  if (req.isAuthenticated()) {
    let user = req.user;

    //this will be needed to populate commodity names in top menu
    let commodityNames = req.session.commodityNames;
    //check whether commodityNames session is set
    req.session.returnToCommodityName = req.path;
    if (commodityNames === null || commodityNames === undefined) {
      return res.redirect('/api/commodity/names');
    }

    let previewImages = req.session.previewImages;

    delete req.session.returnTo;
    delete req.session.returnToCommodityName;
    res.render('itempreview', {
      isAuthenticated: req.isAuthenticated(),
      user: user,
      commodityNames: commodityNames,
      previewImages: previewImages
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    return res.redirect('/user/login?action=login');
  }

});

//view forgot password code page
router.get('/user/resetpassword', function (req, res) {
  removeSessionParameters(req);

  // check whether use logged or not

  let user = req.user;

  //this will be needed to populate commodity names in top menu
  let commodityNames = req.session.commodityNames;
  //check whether commodityNames session is set
  req.session.returnToCommodityName = req.path;
  if (commodityNames === null || commodityNames === undefined) {
    return res.redirect('/api/commodity/names');
  }

  delete req.session.returnTo;
  res.render('resetpassword', {
    user: user,
    recoveryEmail: req.session.recoveryEmail,
    loginOrRegister: 'Enter New Password',
    commodityNames: commodityNames,
  });

});

//view message detail page
router.get('/user/messages/id/:id', function (req, res) {
  removeSessionParameters(req);
  // check whether use logged or not
  let user = req.user;
  if (user === undefined) {
    req.session.returnTo = req.path;
    if(req.query.expUsr){
      return res.redirect('/user/login?action=login&expUsr=' + req.query.expUsr);
    } else {
      return res.redirect('/user/login?action=login');
    }
  }
  delete req.session.returnTo;
  require('./message-controller').getMsgById(req.params.id, user.id, function (msg) {
    if(msg.length === 0) {
      res.redirect('/user/inbox');
    } else {
      res.render('viewmessagedetails', {
        user: user,
        messageDetails: msg[0],
        messageReplies: msg[0].messageReplies
      });
    }
  });

});

//view inbox page
router.get('/user/inbox', function (req, res) {
  removeSessionParameters(req);
  // check whether use logged or not
  let user = req.user;
  if (user === undefined) {
    req.session.returnTo = req.path;
    return res.redirect('/user/login?action=login');
  }
  delete req.session.returnTo;
  require('./message-controller').getInboxList(user.id, function (msgs) {
    res.render('viewmessagesinbox', {
      user: user,
      inboxMessages: msgs,
    });
  });
});

router.get('/user/sent', function (req, res) {
  removeSessionParameters(req);
  // check whether use logged or not
  let user = req.user;
  if (user === undefined) {
    req.session.returnTo = req.path;
    return res.redirect('/user/login?action=login');
  }
  delete req.session.returnTo;
  require('./message-controller').getSentList(user.id, function (msgs) {
    res.render('viewmessagessent', {
      user: user,
      sentMessages: msgs,
    });
  });
});

router.get('/team', function (req, res) {
  removeSessionParameters(req);
  let user = req.user;
  res.render('team', {
    user: user,
  });
});
router.get('/who_we_are', function (req, res) {
  removeSessionParameters(req);
  let user = req.user;
  res.render('who_we_are', {
    user: user,
  });
});
router.get('/how_to', function (req, res) {
  removeSessionParameters(req);
  let user = req.user;
  res.render('how_to', {
    user: user,
  });
});
router.get('/help', function (req, res) {
  removeSessionParameters(req);
  let user = req.user;
  res.render('help', {
    user: user,
  });
});

// redirection
router.get('/news', function (req, res) {
  res.redirect('/news/start/0?category=all&keyword=all');
});

router.get('/my_hidden_links', function (req, res) {
  removeSessionParameters(req);
  let user = req.user;
  res.render('hidden-urls', {
    user: user,
  });
});

router.get('/need_auth', function (req, res) {
  req.session.returnTo = req.query.returnTo;

  if (req.query.listingPage) {
    req.session.listingPageDetails = {
      yourOffer: req.query.yourOffer,
      quantity: req.query.quantity,
      desPort: req.query.desPort,
      note: req.query.note
    };
    return res.jsonp({redirectTo: '/user/login?action=login'})
  }
  return res.redirect('/user/login?action=login');
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
