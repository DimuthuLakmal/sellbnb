var express = require('express');
var _ = require('lodash');
var router = express.Router();
var models = require('./../models');
var sequelize = models.sequelize;


//view home page
router.get('/', function(req, res) {
  removeSessionParameters(req);
  //retreieve popular commodities from session
  var commodityPopular = req.session.commodityPopular;
  var commodityNames = req.session.commodityNames;
  var latestItems = req.session.latestItems;

  //check whether commodityPopular session is set
  if (commodityPopular === null || commodityPopular === undefined) {
    res.redirect('/api/commodity/viewpopular');
  }
  //check whether commodityNames session is set
  if (commodityNames === null || commodityNames === undefined) {
    res.redirect('/api/commodity/names');
  }
  //check whether latest items session is set
  if (latestItems === null || latestItems === undefined) {
    res.redirect('/api/items/viewlatest');
  }

  delete req.session.returnTo;
  delete req.session.commodityPopular;
  delete req.session.latestItems;
  delete req.session.latestItems;
  res.render('index', {
    commodityNames: commodityNames,
    latestItems: latestItems,
    commodityPopular: commodityPopular,
  });

  // if(req.isAuthenticated()) {
  //   delete req.session.returnTo;
  //   delete req.session.commodityPopular;
  //   delete req.session.latestItems;
  //   delete req.session.latestItems;
  //   res.render('index', {
  //     isAuthenticated : req.isAuthenticated(),
  //     user: req.user,
  //     commodityNames: commodityNames,
  //     latestItems: latestItems,
  //     commodityPopular: commodityPopular,
  //   });
  // } else {
  //   //set visited path to session. It uses to rediect to again to that page when login success.
  //   req.session.returnTo = req.path;
  //   console.log(req.session.returnTo);
  //   res.redirect('/user/login');
  // }
});


/* GET add news page. */
router.get('/addnews', function(req, res) {
  removeSessionParameters(req);
  res.render('addnews');
});

/* GET view first news page. */
router.get('/news', function(req, res) {
  removeSessionParameters(req);
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

  req.session.newsall = null;
  req.session.newsOffset = null;
  req.session.newsCount = null;
  res.render('viewnewsall', {News: newsAll, currentPageNumber: currentPageNumber,
    maxPageCount: maxPageCount, pageMultipationFactor: pageMultipationFactor});
});

/* GET view news page other than first page */
router.get('/news/start/:start', function(req, res) {
  removeSessionParameters(req);
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

  req.session.newsall = null;
  req.session.newsOffset = null;
  req.session.newsCount = null;
  res.render('viewnewsall', {News: newsAll, currentPageNumber: currentPageNumber,
    maxPageCount: maxPageCount, pageMultipationFactor: pageMultipationFactor});
});

/* GET view single news page*/
router.get('/news/id/:id', function(req, res) {
  removeSessionParameters(req);
  console.log('visited');
  var news = req.session.specificNews;

  //check whether newsAll session is set
  if (news === null || news === undefined) {
    res.redirect('/api/news/id/'+req.params.id);
  }

  req.session.specificNews = null;
  res.render('viewnews', {News: news});
});

//view basic details
router.get('/user/basic', function(req, res) {
  removeSessionParameters(req);
  //check whether use logged or not
  var errorMessage = req.session.errorMessage || '';
  delete req.session.errorMessage;
  if(req.isAuthenticated()) {
    delete req.session.returnTo;
    res.render('useraccountbasics', {
      isAuthenticated : req.isAuthenticated(),
      user: req.user,
      errorMessage: errorMessage,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    console.log(req.session.returnTo);
    res.redirect('/user/login');
  }
});


//view contact details
router.get('/user/contact', function(req, res) {
  removeSessionParameters(req);
  //check whether use logged or not
  var errorMessage = req.session.errorMessage || '';
  delete req.session.errorMessage;
  if(req.isAuthenticated()) {
    delete req.session.returnTo;
    res.render('useraccountcontactinformation', {
      isAuthenticated : req.isAuthenticated(),
      user: req.user,
      errorMessage: errorMessage,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    console.log(req.session.returnTo);
    res.redirect('/user/login');
  }
});

//add commodity details
router.get('/commodity/add', function(req, res) {
  removeSessionParameters(req);
  res.render('addcommodity');

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
  var commodities = req.session.commodities;

  //check whether commodities session is set
  if (commodities === null || commodities === undefined) {
    res.redirect('/api/commodity/viewall');
  }

  req.session.commodities = null;

  if(req.isAuthenticated()) {
    delete req.session.returnTo;
    res.render('searchcommodityadd', {
      isAuthenticated : req.isAuthenticated(),
      user: req.user,
      Commodities: commodities.rows,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    console.log(req.session.returnTo);
    res.redirect('/user/login');
  }
});

/* GET view search results page*/
router.get('/items', function(req, res) {
  var searchResult = req.session.searchResult;
  var searchResultRemainingTime = req.session.searchResultRemainingTime;
  var maxPrice = req.session.maxPrice;
  var distinctCharacteristics = req.session.distinctCharacteristics;
  var selectedClass = req.session.selectedClass;
  var selectedSegment = req.session.selectedSegment;
  var keyword = req.session.keyword;
  var startPrice = req.session.startPrice ? req.session.startPrice: 0;
  var endPrice = req.session.endPrice ? req.session.endPrice: maxPrice;

  var itemsOffset = req.session.itemsOffset;
  var itemsCount = req.session.itemsCount;
  var currentPageNumber = (parseInt(itemsOffset)/10)+1;
  var maxPageCount = Math.floor(itemsCount/10);
  //Note: check whether equation is correct. previous one is maxPageCount % 10 !== 0
  if(itemsCount % 10 !== 0) {
    maxPageCount++;
  }
  var pageMultipationFactor = Math.floor((parseInt(itemsOffset)/30));

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
  });

  // if(req.isAuthenticated()) {
  //   delete req.session.returnTo;
  //   res.render('searchresults', {
  //     isAuthenticated : req.isAuthenticated(),
  //     user: req.user,
  //     items: searchResult,
  //   });
  // } else {
  //   //set visited path to session. It uses to rediect to again to that page when login success.
  //   req.session.returnTo = req.path;
  //   console.log(req.session.returnTo);
  //   res.redirect('/user/login');
  // }
});

/* GET view search commodity page for item add*/
router.get('/items/add/commoditydetails', function(req, res) {
  removeSessionParameters(req);
  var commodity = req.session.commodity;

  res.render('commoditydetailsadd', {Commodity: commodity, CommodityAlterNames: commodity.CommodityAlterNames,
      CommodityImages: commodity.CommodityImages, CommodityParameters: commodity.CommodityParameters});
});

/* GET view item add page*/
router.get('/items/add', function(req, res) {
  removeSessionParameters(req);

  var commodityId = req.query['id'];
  if(commodityId !== null && commodityId !== undefined) {
    req.session.commodityId = commodityId;
  }
  var warehouses = req.session.warehouses;

  //check whether warehouses session is set
  if (warehouses === null || warehouses === undefined) {
    res.redirect('/api/user/view/warehouses/userId/'+req.user.id);
  }

  if(req.isAuthenticated()) {
    delete req.session.returnTo;
    res.render('additem', {
      isAuthenticated : req.isAuthenticated(),
      user: req.user,
      CommodityId: req.session.commodityId,
      WareHouses: warehouses,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    console.log(req.session.returnTo);
    res.redirect('/user/login');
  }
});

router.get('/items/id/:id', function(req, res) {
  removeSessionParameters(req);
  var item = req.session.specificBiddingItem;
  var bidwarehouses = req.session.bidwarehouses;
  var lastBid = req.session.lastBid;
  var lastUserBid = req.session.lastUserBid;
  var user = {id: 1};

  //check whether item is retrieved from database
  if (item === null || item === undefined) {
    res.redirect('/api/items/id/'+req.params.id);
  }

  //check whether bid details are retrieved from database
  if (lastBid === null || lastBid === undefined) {
    res.redirect('/api/bid/items/userId/'+user.id+'/itemId/'+req.params.id);
  }

  console.log(item.itemComments);

  //check whether user is set. this is needed to retrieve user's warehouses
  if ((bidwarehouses === null || bidwarehouses === undefined) && (user !=null && user != undefined)) {
    res.redirect('/api/user/bidding/warehouses/userId/'+user.id+'/itemId/'+item.item.id);
  }

  req.session.lastBid = null;
  req.session.lastUserBid = null;
  req.session.specificBiddingItem = null;
  res.render('bidpage', {
    item: item,
    userWareHouses: bidwarehouses,
    itemComments: item.itemComments,
    user: user,
    lastBid: lastBid[0],
    lastUserBid: lastUserBid[0],
  });

  // if(req.isAuthenticated()) {
  //   delete req.session.returnTo;
  //   res.render('bidpage', {
  //     isAuthenticated : req.isAuthenticated(),
  //     user: req.user,
  //     item: item,
  //   });
  // } else {
  //   //set visited path to session. It uses to rediect to again to that page when login success.
  //   req.session.returnTo = req.path;
  //   console.log(req.session.returnTo);
  //   res.redirect('/user/login');
  // }
});

//to remove unnecessary session parameters
function removeSessionParameters(req) {
  delete req.session.selectedClass;
  delete req.session.selectedSegment;
  delete req.session.keyword;
  delete req.session.startPrice;
  delete req.session.endPrice;
}

module.exports = router;
