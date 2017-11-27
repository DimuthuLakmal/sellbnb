var express = require('express');
var expressSession = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');

var routes = require('./routes/index');
var users = require('./routes/users');
var login = require('./routes/login');
var news = require('./routes/news');
var commodity = require('./routes/commodity');
var items = require('./routes/items');
var signup = require('./routes/signup');
var bid = require('./routes/bid');
var notification = require('./routes/notification');
var usermessage = require('./routes/message');
var country = require('./routes/country');
var recentsearch = require('./routes/recentsearch');
var offers = require('./routes/offer');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(cookieParser());

//setting up passportjs
var flash = require("connect-flash");
app.use(flash());
app.use(expressSession({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//----------------- Following methods moved to user route-------------------
// passport.use(new passportLocal.Strategy(verifyCredentials));
// passport.use(new passportHttp.BasicStrategy(verifyCredentials));
// passport.serializeUser(function (user, done) {
//   done(null, user.id);
// });
// passport.deserializeUser(function(id, done) {
//   //Query database of cache here!
//   done(null, {id: id, name: id});
// });
// function ensureAuthenticated(req, res, next) {
//   if(req.isAuthenticated()) {
//     next();
//   } else {
//     res.send(403);
//   }
// }
// function verifyCredentials(username, password, done) {
//   if(username === password) {
//     done(null, {id: username, name: username});
//   } else {
//     done(null, null);
//   }
// }
//---------------------------------------------------------------------

app.use(express.static(path.join(__dirname, 'public')));
app.use('/news/start', express.static(path.join(__dirname, 'public')));
app.use('/news/id', express.static(path.join(__dirname, 'public')));
app.use('/user', express.static(path.join(__dirname, 'public')));
app.use('/commodity/add', express.static(path.join(__dirname, 'public')));
app.use('/items', express.static(path.join(__dirname, 'public')));
app.use('/items/add', express.static(path.join(__dirname, 'public')));
app.use('/items/id', express.static(path.join(__dirname, 'public')));
app.use('/user/sell/list/start', express.static(path.join(__dirname, 'public')));
app.use('/user/sell/bids/start', express.static(path.join(__dirname, 'public')));
app.use('/user/buy/list/start', express.static(path.join(__dirname, 'public')));
app.use('/user/buy/contract/id/', express.static(path.join(__dirname, 'public')));
app.use('/user/sell/contract/bidId/', express.static(path.join(__dirname, 'public')));
app.use('/user/public/userId/', express.static(path.join(__dirname, 'public')));
app.use('/user/forgotpassword/', express.static(path.join(__dirname, 'public')));
app.use('/user/sell/', express.static(path.join(__dirname, 'public')));
app.use('/user/messages/id', express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/user', users);
app.use('/api/user', users);
app.use('/api/commodity', commodity);
app.use('/api/items', items);
app.use('/api/bid', bid);
app.use('/api/notification', notification);
app.use('/api/messages', usermessage);
app.use('/api/countries', country);
app.use('/api/recentsearch', recentsearch);
app.use('/api/offer', offers);
// app.use('/logout', function (req, res) {
//   req.logout();
//   res.redirect('/');
// });

//app.use('/api', passport.authenticate('basic', {session: false}));
app.use('/api/news', news);

//----------------- Following methods moved to user route---------------
// app.get('/api/data', ensureAuthenticated,function (req, res) {
//   res.json([
//     {value: 'Dimuthu'},
//     {value: 'Ruwan'},
//     {value: 'Kamal'}
//   ])
// })
//---------------------------------------------------------------------

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
      .render('error', {
        message: err.message,
        error: err
      });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500).render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
