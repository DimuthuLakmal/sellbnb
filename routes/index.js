var express = require('express');
var _ = require('lodash');
var router = express.Router();
var models = require('./../models');
var sequelize = models.sequelize;

/* GET add news page. */
router.get('/addnews', function(req, res) {
  res.render('addnews');
});

/* GET view first news page. */
router.get('/news', function(req, res) {
  var newsAll = req.session.newsall;
  var newsOffset = req.session.newsOffset;
  var newsCount = req.session.newsCount;
  var currentPageNumber = (parseInt(newsOffset)/3)+1;
  var maxPageCount = Math.floor(newsCount/3);
  if(maxPageCount % 3 !== 0) {
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
  var newsAll = req.session.newsall;
  var newsOffset = req.session.newsOffset;
  var newsCount = req.session.newsCount;
  var currentPageNumber = (parseInt(newsOffset)/3)+1;
  var maxPageCount = Math.floor(newsCount/3);
  if(maxPageCount % 3 !== 0) {
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


module.exports = router;
