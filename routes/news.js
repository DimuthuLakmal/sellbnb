var express = require('express');
var _ = require('lodash');
var router = express.Router();
var models = require('./../models');
var sequelize = models.sequelize;

/* Add news to database. */
router.post('/addnews', function (req, res) {
    //retrieve data from req object
    var title = req.body.title;
    var category = req.body.category;
    var news_content = req.body.news_content;

    //store news in database
    sequelize.sync().then(
        function () {
            var News = models.News;
            News.create({
                title: title,
                category: category,
                content: news_content,
                hits: 0,
                UserId: 1,
            }).then(function (insertedNews) {
            });
        }
    ).catch(function (error) {
        console.log(error);
    });

    res.redirect('/addnews');
});

/* Add news to database. */
router.post('/addcomment', function (req, res) {
    //retrieve data from req object
    var name = req.body.name;
    var email = req.body.email;
    var comment = req.body.comment;
    var NewsId = req.body.NewsId;

    //store news in database
    sequelize.sync().then(
        function () {
            var Comment = models.Comment;
            Comment.create({
                name: name,
                email: email,
                comment: comment,
                NewsId: NewsId
            }).then(function (insertedComment) {
            });
        }
    ).catch(function (error) {
        console.log(error);
    });

    res.redirect('/news/id/'+NewsId);
});

/* Retrieve all news from database */
router.get('/viewall/start/:start', function (req, res) {
    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var News = models.News;
            var User = models.User;
            News.findAndCountAll({
                limit: 3,
                offset: parseInt(req.params.start),
                include: [User],
                order: '`id` DESC'
            }).then(function (News) {
                //saving news array to a session and redirect
                newsArray(News, req.params.start, req, res);
            });
        }
    );
});

/* Retrieve news specific to a category from database */
router.get('/viewall/start/:start/category/:category', function (req, res) {
    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var News = models.News;
            var User = models.User;
            News.findAndCountAll({
                where: {category: [req.params.category]},
                limit: 3,
                offset: parseInt(req.params.start),
                include: [User],
                order: '`id` DESC'
            }).then(function (News) {
                //saving news array to a session and redirect
                newsArray(News, 0, req, res);
            });
        }
    );
});

/* Retrieve popluar news from database */
router.get('/viewpopular', function (req, res) {
    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var News = models.News;
            var User = models.User;
            News.findAndCountAll({
                limit: 3,
                include: [User],
                order: '`hits` DESC'
            }).then(function (News) {
                var newsArr = [];
                //pushing retrieved data to newsArr
                _.forEach(News.rows, function(news, index) {
                    var id = news.id;
                    var title = news.title;
                    var category = news.category;
                    var createdAt = news.createdAt;

                    //mapping month
                    var dateComponents = createdAt.toString().split(" ");
                    var dateOfNews = dateComponents[2];
                    var monthOfNews = dateComponents[1];
                    var yearOfNews = dateComponents[3];

                    newsArr.push({'id': id, 'title': title, 'category': category,
                        'date': dateOfNews, 'month': monthOfNews,'year': yearOfNews});
                });
                res.jsonp(newsArr);//encoding as jsonp response
            });
        }
    );
});

/* Retrieve recent news from database */
router.get('/viewrecent', function (req, res) {
    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var News = models.News;
            var User = models.User;
            News.findAndCountAll({
                limit: 3,
                include: [User],
                order: '`createdAt` DESC'
            }).then(function (News) {
                var newsArr = [];
                //pushing retrieved data to newsArr
                _.forEach(News.rows, function(news, index) {
                    var id = news.id;
                    var title = news.title;
                    var category = news.category;
                    var createdAt = news.createdAt;

                    //mapping month
                    var dateComponents = createdAt.toString().split(" ");
                    var dateOfNews = dateComponents[2];
                    var monthOfNews = dateComponents[1];
                    var yearOfNews = dateComponents[3];

                    newsArr.push({'id': id, 'title': title, 'category': category,
                        'date': dateOfNews, 'month': monthOfNews,'year': yearOfNews});
                });
                res.jsonp(newsArr);//encoding as jsonp response
            });
        }
    );
});


/* Retrieve recent news from database */
/* Usage: Home Page */
router.get('/viewlatest', function (req, res) {
    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var News = models.News;
            var User = models.User;
            News.findAndCountAll({
                limit: 3,
                include: [User],
                order: '`createdAt` DESC'
            }).then(function (News) {
                //saving news array to a session and redirect
                newsArray(News, null, req, res);
            });
        }
    );
});


/* Retrieve specific news and its comments from database */
router.get('/id/:id', function (req, res) {
    //retrieve data from req object
    sequelize.sync().then(
        function () {
            var News = models.News;
            var User = models.User;
            var Comment = models.Comment;

            var newsId = req.params.id;
            News.findAll({
                where: {id: newsId},
                include: [User,Comment],
            }).then(function (News) {
                var news = News[0].dataValues;
                var id = news.id;
                var title = news.title;
                var category = news.category;
                var hits = news.hits;
                var user = news.User.full_name;
                var content = news.content;
                var createdAt = news.createdAt;
                var paragraphs = [];

                //extracting paragraphs,image by removing <p> tags and <img> tags
                var img = content.substring(content.indexOf('src="',content.indexOf("<img"))+5
                    ,content.indexOf('"',content.indexOf('src=\"')+5));
                var imgToReplace = content.substring(content.indexOf('<img')
                    ,content.indexOf('>',content.indexOf('<img'))+1);
                var removedImageContent = content.replace(imgToReplace, "");
                var removedParagraphStartTag = removedImageContent.split("<p>");
                _.forEach(removedParagraphStartTag, function(paragraphWithEndTag) {
                    paragraphs.push(paragraphWithEndTag.split("</p>")[0]);
                });

                //mapping month
                var dateComponents = createdAt.toString().split(" ");
                var dateOfNews = dateComponents[2];
                var monthOfNews = dateComponents[1];
                var yearOfNews = dateComponents[3];

                req.session.specificNews = {'id': id, 'title': title, 'category': category, 'img': img,
                    'hits': hits, 'paragraphs': paragraphs, 'user': user, 'date': dateOfNews,
                    'month': monthOfNews,'year': yearOfNews, comments: news.Comments};

                var News = models.News;
                News.update(
                    { hits: (hits+1) },
                    { where: { id: id } }
                ).then(function (results) {
                    res.redirect('/news/id/'+newsId);
                });
            });
        }
    );
});

//Construct NewsArray from retrieved data from db and redirect
function newsArray (News, offset , req, res) {
    var newsArr = [];

    _.forEach(News.rows, function(news) {
        var id = news.id;
        var title = news.title;
        var category = news.category;
        var hits = news.hits;
        var user = news.User.full_name;
        var content = news.content;
        var createdAt = news.createdAt;

        //removing <p> tags and <img> tags and extract image
        var img = content.substring(content.indexOf('src="',content.indexOf("<img"))+5
            ,content.indexOf('"',content.indexOf('src=\"')+5));
        var imgToReplace = content.substring(content.indexOf('<img')
            ,content.indexOf('>',content.indexOf('<img'))+1);
        var removedImage = content.replace(imgToReplace, "");
        var removedParagraphStartTag = removedImage.split("<p>").join("");
        var removedParagraphEndTag = removedParagraphStartTag.split("</p>").join("");

        //mapping month
        var dateComponents = createdAt.toString().split(" ");
        var dateOfNews = dateComponents[2];
        var monthOfNews = dateComponents[1];
        var yearOfNews = dateComponents[3];

        newsArr.push({'id': id, 'title': title, 'category': category, 'img': img,
            'hits': hits, 'content': removedParagraphEndTag, 'user': user, 'date': dateOfNews,
            'month': monthOfNews,'year': yearOfNews});
    });

    if(offset != null) {
        req.session.newsall = newsArr;
        req.session.newsCount = News.count;
        req.session.newsOffset = parseInt(req.params.start);

        if(parseInt(offset) !== 0) {
            res.redirect('/news/start/'+offset);
        } else {
            res.redirect('/news');
        }
    } else {
        req.session.latestNews = newsArr;
        res.redirect('/');
    }

}

module.exports = router;
