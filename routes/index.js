var express = require('express');
var _ = require('lodash');
var router = express.Router();


//view home page
router.get('/', function(req, res) {
  removeSessionParameterSellingPage(req);
  removeSessionParameters(req);

  //retreieve popular commodities from session
  var commodityPopular = req.session.commodityPopular;
  var commodityNames = req.session.commodityNames;
  var latestItems = req.session.latestItems;
  var notifications = req.session.notifications;

  //check whether commodityPopular session is set
  if (commodityPopular === null || commodityPopular === undefined) {
    res.redirect('/api/commodity/viewpopular');
  }
  //check whether commodityNames session is set
  if (commodityNames === null || commodityNames === undefined) {
    res.redirect('/api/commodity/names');
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
  delete req.session.commodityPopular;
  delete req.session.latestItems;
  delete req.session.latestItems;
  res.render('index', {
    notifications: notifications,
    commodityNames: commodityNames,
    latestItems: latestItems,
    commodityPopular: commodityPopular,
    notifications: notifications,
  });

});


/* GET add news page. */
router.get('/addnews', function(req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  var notifications = req.session.notifications;
  //check whether notification session is set.
  if(req.isAuthenticated()) {
    if (notifications === null || notifications === undefined) {
      res.redirect('/api/notification/userId/'+req.user.id);
    }
  }

  //this will be needed to populate commodity names in top menu
  var commodityNames = req.session.commodityNames
  //check whether commodityNames session is set
  if (commodityNames === null || commodityNames === undefined) {
    res.redirect('/api/commodity/names');
  }

  res.render('addnews', {
    commodityNames: commodityNames,
    notifications: notifications,
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
  res.render('viewnewsall', {
    News: newsAll,
    currentPageNumber: currentPageNumber,
    maxPageCount: maxPageCount,
    pageMultipationFactor: pageMultipationFactor,
    commodityNames: commodityNames,
    notifications: notifications,
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
  res.render('viewnewsall', {
    News: newsAll,
    currentPageNumber: currentPageNumber,
    maxPageCount: maxPageCount,
    pageMultipationFactor: pageMultipationFactor,
    commodityNames: commodityNames,
    notifications: notifications
  });
});

/* GET view single news page*/
router.get('/news/id/:id', function(req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);
  console.log('visited');
  var news = req.session.specificNews;

  //check whether newsAll session is set
  if (news === null || news === undefined) {
    res.redirect('/api/news/id/'+req.params.id);
  }

  //this will be needed to populate commodity names in top menu
  var commodityNames = req.session.commodityNames
  //check whether commodityNames session is set
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
  res.render('viewnews', {
        News: news,
        commodityNames: commodityNames,
        notifications: notifications,
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
    console.log(req.session.returnTo);
    res.redirect('/user/login');
  }
});


//view contact details
router.get('/user/contact', function(req, res) {
  removeSessionParameters(req);
  removeSessionParameterSellingPage(req);

  //check whether use logged or not
  var errorMessage = req.session.errorMessage || '';
  delete req.session.errorMessage;
  if(req.isAuthenticated()) {
    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
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
    res.render('useraccountcontactinformation', {
      isAuthenticated : req.isAuthenticated(),
      user: req.user,
      errorMessage: errorMessage,
      commodityNames: commodityNames,
      notifications: notifications,
    });
  } else {
    //set visited path to session. It uses to rediect to again to that page when login success.
    req.session.returnTo = req.path;
    console.log(req.session.returnTo);
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
        res.render('userbusinessinformation', {
            isAuthenticated : req.isAuthenticated(),
            user: req.user,
            errorMessage: errorMessage,
            commodityNames: commodityNames,
            notifications: notifications,
        });
    } else {
        //set visited path to session. It uses to rediect to again to that page when login success.
        req.session.returnTo = req.path;
        console.log(req.session.returnTo);
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
        res.render('userpaymentinformation', {
            isAuthenticated : req.isAuthenticated(),
            user: req.user,
            errorMessage: errorMessage,
            commodityNames: commodityNames,
            notifications: notifications,
        });
    } else {
        //set visited path to session. It uses to rediect to again to that page when login success.
        req.session.returnTo = req.path;
        console.log(req.session.returnTo);
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
        console.log(req.session.returnTo);
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

  res.render('addcommodity', {
    commodityNames: commodityNames,
    notifications: notifications,
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
    console.log(req.session.returnTo);
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
    res.render('commoditydetailsadd', {
      isAuthenticated : req.isAuthenticated(),
      user: req.user,
      Commodity: commodity,
      CommodityAlterNames: commodity.CommodityAlterNames,
      CommodityImages: commodity.CommodityImages,
      CommodityParameters: commodity.CommodityParameters,
      commodityNames: commodityNames,
      notifications: notifications,
     });
    } else {
      //set visited path to session. It uses to rediect to again to that page when login success.
      req.session.returnTo = req.path;
      console.log(req.session.returnTo);
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

    //check whether warehouses session is set
    if (warehouses === null || warehouses === undefined) {
      res.redirect('/api/user/view/warehouses/userId/'+req.user.id);
    }

    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
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
    res.render('additem', {
      isAuthenticated : req.isAuthenticated(),
      user: req.user,
      CommodityId: req.session.commodityId,
      WareHouses: warehouses,
      commodityNames: commodityNames,
      notifications: notifications,
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
    console.log(req.session.returnTo);
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
      console.log(req.session.returnTo);
      res.redirect('/user/login');
    }
});


//view bidding details of user
router.get('/user/buy/list/start/:start', function(req, res) {
  removeSessionParameters(req);

  var user = {id: 1};

  // check whether use logged or not
  //if(req.isAuthenticated()) {
    //var user = req.user;
    var buyingList = req.session.buyingList;
    var remainingTimes = req.session.searchResultRemainingTimeBuying;
    var filterParamer = req.session.buyingpageItemOption;

    console.log(filterParamer);

    //check whether biddinglist session is set
    if (buyingList === null || buyingList === undefined) {
      res.redirect('/api/bid/start/'+req.params.start+'/userId/'+user.id);
    }
    console.log(buyingList[2]);
    //this will be needed to populate commodity names in top menu
    var commodityNames = req.session.commodityNames
    //check whether commodityNames session is set
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
  // } else {
  //   //set visited path to session. It uses to rediect to again to that page when login success.
  //   req.session.returnTo = req.path;
  //   console.log(req.session.returnTo);
  //   res.redirect('/user/login');
  // }
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

      //this will be needed to populate commodity names in top menu
      var commodityNames = req.session.commodityNames
      //check whether commodityNames session is set
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

      req.session.biddingList = null;
      req.session.bidwarehouses = null;
      req.session.specificBiddingItemSell = null;
      delete req.session.biddingSellingAccountOffset;
      delete req.session.bidwarehouses;
      delete req.session.biddingSellingAccountCount;
      delete req.session.returnTo;
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
        userWareHousesSell: userwarehousesSell,
        commodityNames: commodityNames,
        notifications: notifications,
      });
    } else {
      //set visited path to session. It uses to rediect to again to that page when login success.
      req.session.returnTo = req.path;
      console.log(req.session.returnTo);
      res.redirect('/user/login');
    }
});

//view buyer contract
router.get('/user/buy/contract/id/:id', function(req, res) {
  removeSessionParameters(req);

  // check whether use logged or not
  //if(req.isAuthenticated()) {
    var user = {id: 1};
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
    res.render('buyercontract', {
      isAuthenticated : req.isAuthenticated(),
      user: user,
      buyContractItem: buyContractItem,
      buyContractBid: buyContractBid,
      commodityNames: commodityNames,
      notifications: notifications,
      contractDate: contractDate,
    });
  // } else {
  //   //set visited path to session. It uses to rediect to again to that page when login success.
  //   req.session.returnTo = req.path;
  //   console.log(req.session.returnTo);
  //   res.redirect('/user/login');
  // }
});

//view seller contract
router.get('/user/sell/contract/bidId/:bidId', function(req, res) {
  removeSessionParameters(req);

  // check whether use logged or not
  //if(req.isAuthenticated()) {
  var user = {id: 1};
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
  res.render('sellercontract', {
    isAuthenticated : req.isAuthenticated(),
    user: user,
    sellContractItem: sellContractItem,
    sellContractBid: sellContractBid,
    commodityNames: commodityNames,
    notifications: notifications,
    contractDate: contractDate,
  });
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

//remove unnecessary session paramters when created at user selling page, when switching to other routes
function removeSessionParameterSellingPage(req) {
    delete req.session.sellpageItemOption;
}
module.exports = router;
