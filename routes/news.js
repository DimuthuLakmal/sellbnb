var express = require('express');
var _ = require('lodash');
var router = express.Router();
var models = require('./../models');
var sequelize = models.sequelize;
var fs = require('fs');
var path = require('path');

/* Add news to database. */
router.post('/addnews', function (req, res) {
    //retrieve data from req object
    var userId = req.body.userId;
    var title = req.body.title;
    var old_title = req.body.old_title;
    var category = req.body.category;
    var language = req.body.language;
    var news_content = req.body.news_content;
    var keywords = req.body.keywords;

    if(old_title != "Select News Title") {
        var newId = old_title;

        var newsObject = {};
        if(language == "English") {
            newsObject = {
                english_title: title,
                english_content: news_content,
                UserId: userId,
            }
        } else if(language == "Sinhala"){
            newsObject = {
                sinhala_title: title,
                sinhala_content: news_content,
                UserId: userId,
            }
        } else if(language == "Tamil") {
            newsObject = {
                tamil_title: title,
                tamil_content: news_content,
                UserId: userId,
            }
        }

        models.News.update(
            newsObject,
            { where: { id: newId } }
        ).then(function (results) {
            res.sendStatus(200);
        });
    } else {

        //write images to image files
        _.forEach(req.body.images, function(image, index) {
            var imageBuffer = decodeBase64Image(image.data); //decoding base64 images
            fs.writeFile('../public/uploads/news/'+image.filename, imageBuffer.data, function(err) {
                console.log(err);
            });
        });

        var imageURL = req.body.images[req.body.images.length-1].filename;

        var newsObject = {};
        if(language == "English") {
            newsObject = {
                english_title: title,
                category: category,
                english_content: news_content,
                hits: 0,
                thumbnail: imageURL,
                keywords: keywords,
                UserId: userId,
            }
        } else if(language == "Sinhala"){
            newsObject = {
                sinhala_title: title,
                category: category,
                sinhala_content: news_content,
                hits: 0,
                thumbnail: imageURL,
                keywords: keywords,
                UserId: userId,
            }
        } else if(language == "Tamil") {
            newsObject = {
                tamil_title: title,
                category: category,
                tamil_content: news_content,
                hits: 0,
                thumbnail: imageURL,
                keywords: keywords,
                UserId: userId,
            }
        }
        //store news in database
        sequelize.sync().then(
            function () {
                var News = models.News;
                News.create(newsObject).then(
                    function (insertedNews) {
                        res.sendStatus(200);
                    }
                );
            }
        ).catch(function (error) {
            console.log(error);
        });
    }
});

/* Add news to database. */
router.get('/titles', function (req, res) {

    //store news in database
    sequelize.sync().then(
        function () {
            var News = models.News;
            var User = models.User;
            News.findAll({
                attributes: ['id','english_title'],
            }).then(function (News) {
                req.session.newsTitles = News;
                res.redirect('/addnews');
            });
        }
    );


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
// router.get('/viewall/start/:start', function (req, res) {
//     //retrieve data from req object
//     sequelize.sync().then(
//         function () {
//             var News = models.News;
//             var User = models.User;
//             News.findAndCountAll({
//                 limit: 3,
//                 offset: parseInt(req.params.start),
//                 include: [User],
//                 order: '`id` DESC'
//             }).then(function (News) {
//                 //saving news array to a session and redirect
//                 newsArray(News, req.params.start, req, res);
//             });
//         }
//     );
// });

/* Retrieve news specific to a category from database */
router.get('/start/:start', function (req, res) {
    var keyword = req.query['keyword'];
    var category = req.query['category'];
    var start = req.params.start;

    var whereObject = {};
    var isFromOtherPage = true;
    if(keyword != 'all' && category == 'all') {
        whereObject =  {keywords: {$like: '%'+keyword.toLowerCase()+'%'}};
        isFromOtherPage = false;
    } else if(keyword == 'all' && category != 'all') {
        whereObject =  {category: [category]};
        isFromOtherPage = false;
    } else if(keyword == 'all' && category == 'all') {
        whereObject =  {category: [category]};
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
                    newsArray(News, start, req, res, category, keyword);
                });
            }
        );
    }

    if(!isFromOtherPage) {
        //retrieve data from req object
        sequelize.sync().then(
            function () {
                var News = models.News;
                var User = models.User;
                News.findAndCountAll({
                    where: whereObject,
                    limit: 3,
                    offset: parseInt(start),
                    include: [User],
                    order: '`id` DESC'
                }).then(function (News) {
                    //saving news array to a session and redirect
                    newsArray(News, start, req, res, category, keyword);
                });
            }
        );
    }

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
                    var title = news.english_title;
                    var category = news.category;
                    var createdAt = news.createdAt;
                    var thumbnail = news.thumbnail;

                    //mapping month
                    var dateComponents = createdAt.toString().split(" ");
                    var dateOfNews = dateComponents[2];
                    var monthOfNews = dateComponents[1];
                    var yearOfNews = dateComponents[3];

                    newsArr.push({'id': id, 'title': title, 'category': category,
                        'date': dateOfNews, 'month': monthOfNews,'year': yearOfNews,'thumbnail': thumbnail});
                });
                res.jsonp(newsArr);//encoding as jsonp response
            });
        }
    );
});

/* Retrieve news have keywords from database */
/* Usage: keyword search new news page */
// router.get('/viewall/keyword/start/:start', function (req, res) {
//     //retrieve news which has keyword in keyword column
//     sequelize.sync().then(
//         function () {
//             var News = models.News;
//             var User = models.User;
//             News.findAndCountAll({
//                 where: {keywords: {$like: '%'+req.query['keyword'].toLowerCase()+'%'}},
//                 limit: 3,
//                 offset: parseInt(req.params.start),
//                 include: [User],
//                 order: '`id` DESC'
//             }).then(function (News) {
//                 //saving news array to a session and redirect
//                 newsArray(News, 0, req, res);
//             });
//         }
//     );
// });

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
                    var title = news.english_title;
                    var category = news.category;
                    var createdAt = news.createdAt;
                    var thumbnail = news.thumbnail;

                    //mapping month
                    var dateComponents = createdAt.toString().split(" ");
                    var dateOfNews = dateComponents[2];
                    var monthOfNews = dateComponents[1];
                    var yearOfNews = dateComponents[3];

                    newsArr.push({'id': id, 'title': title, 'category': category,
                        'date': dateOfNews, 'month': monthOfNews,'year': yearOfNews, thumbnail: thumbnail});
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
                limit: 4,
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

                var title = '';
                var content = '';
                if(req.query['lan']=='en') {
                    title = news.english_title;
                    content = news.english_content;
                } else if(req.query['lan']=='sn') {
                    title = news.sinhala_title;
                    content = news.sinhala_content;
                } else if(req.query['lan']=='tm') {
                    title = news.tamil_title;
                    content = news.tamil_content;
                }
                var id = news.id;
                var category = news.category;
                var hits = news.hits;
                var user = news.User.full_name;

                var createdAt = news.createdAt;
                var paragraphs = [];

                //extracting paragraphs,image by removing <p> tags and <img> tags
                var img = content.substring(content.indexOf('src="',content.indexOf("<img"))+5
                    ,content.indexOf('"',content.indexOf('src=\"')+5));

                //mapping month
                var dateComponents = createdAt.toString().split(" ");
                var dateOfNews = dateComponents[2];
                var monthOfNews = dateComponents[1];
                var yearOfNews = dateComponents[3];

                req.session.specificNews = {'id': id, 'title': title, 'category': category, 'img': img,
                    'hits': hits, 'user': user, 'date': dateOfNews,
                    'month': monthOfNews,'year': yearOfNews, comments: news.Comments};

                var News = models.News;
                News.update(
                    { hits: (hits+1) },
                    { where: { id: id } }
                ).then(function (results) {
                    res.redirect('/news/id/'+newsId+'?lan='+req.query['lan']);
                });
            });
        }
    );
});

/* Retrieve specific news and its comments from database */
router.get('/news_id/:news_id', function (req, res) {
    //retrieve data from req object
    console.log('visited');
    sequelize.sync().then(
        function () {
            var News = models.News;
            var User = models.User;
            var Comment = models.Comment;

            var newsId = req.params.news_id;
            News.findAll({
                where: {id: newsId},
                include: [User,Comment],
            }).then(function (News) {
                var news = News[0].dataValues;

                var title = '';
                var content = '';
                if(req.query['lan']=='en') {
                    title = news.english_title;
                    content = news.english_content;
                } else if(req.query['lan']=='sn') {
                    title = news.sinhala_title;
                    content = news.sinhala_content;
                } else if(req.query['lan']=='tm') {
                    title = news.tamil_title;
                    content = news.tamil_content;
                }

                //extracting paragraphs,image by removing <p> tags and <img> tags
                if(content.indexOf('<img') != -1) {
                    var imgToReplace = content.substring(content.indexOf('<img')
                        ,content.indexOf('>',content.indexOf('<img'))+1);
                    var removedImageContent = content.replace(imgToReplace, "");
                } else {
                    var removedImageContent = content;
                }

                if(content.indexOf('<table') != -1) {
                    var tableToReplace = removedImageContent.substring(removedImageContent.indexOf('<table')
                        ,removedImageContent.indexOf('>',removedImageContent.indexOf('<table'))+1);
                    console.log(tableToReplace);
                    var removedTableContent = removedImageContent.replace(tableToReplace, '<table class="basic-table">');
                } else {
                    var removedTableContent = removedImageContent;
                }

                var newsContent = {removedTableContent: removedTableContent};

                res.jsonp(newsContent);
            });
        }
    );
});

//Construct NewsArray from retrieved data from db and redirect
function newsArray (News, offset , req, res, category, keyword) {
    console.log('Visited');
    var newsArr = [];
    // var language = req.session.language;

    _.forEach(News.rows, function(news) {
        // var content = '';
        // var title = '';
        var has_sinhala_content = false;
        var has_tamil_content = false;
        if(news.sinhala_content != "" && news.sinhala_content != null) {
            has_sinhala_content = true;
        } else if(news.tamil_content != "" && news.tamil_content != null) {
            has_tamil_content = true;
        }

        // if(content != null && content != '') {
            var id = news.id;
            var category = news.category;
            var hits = news.hits;
            var user = news.User.full_name;
            var createdAt = news.createdAt;
            var content = news.english_content;
            var title = news.english_title;

            //removing <p> tags and <img> tags and extract image
            var removedImage = content;
            var img = '';
            while(removedImage.indexOf('<img') != -1) {
                if(removedImage.indexOf('<img') != -1) {
                    if(img == '') {
                        img = removedImage.substring(removedImage.indexOf('src="',removedImage.indexOf("<img"))+5
                            ,removedImage.indexOf('"',removedImage.indexOf('src=\"')+5));
                    }
                    var imgToReplace = removedImage.substring(removedImage.indexOf('<img')
                        ,removedImage.indexOf('>',removedImage.indexOf('<img'))+1);
                    removedImage = removedImage.replace(imgToReplace, "");
                }
            }

            if(content.indexOf('<table') != -1) {
                var tableToReplace = removedImage.substring(removedImage.indexOf('<table')
                    ,removedImage.indexOf('</table>'));
                var removedTable = removedImage.replace(tableToReplace, "");
            } else {
                var removedTable = removedImage;
            }

            var removedBlankPara = removedTable;
            while(removedBlankPara.indexOf('<p></p>') != -1) {
                if(removedBlankPara.indexOf('<p></p>') != -1) {
                    removedBlankPara = removedBlankPara.replace('<p></p>', "");
                }
            }

            while(removedBlankPara.indexOf('<p>&nbsp;</p>') != -1) {
                if(removedBlankPara.indexOf('<p>&nbsp;</p>') != -1) {
                    removedBlankPara = removedBlankPara.replace('<p>&nbsp;</p>', "");
                }
            }

            //mapping month
            var dateComponents = createdAt.toString().split(" ");
            var dateOfNews = dateComponents[2];
            var monthOfNews = dateComponents[1];
            var yearOfNews = dateComponents[3];

            newsArr.push({'id': id, 'title': title, 'category': category, 'img': img,
                'hits': hits, 'content': removedBlankPara, 'user': user, 'date': dateOfNews,
                'month': monthOfNews,'year': yearOfNews, 'has_sinhala_content': has_sinhala_content, 'has_tamil_content': has_tamil_content});
        // }
    });
    var offset_ = offset;
    var category_ = category;
    var keyword_ = keyword;
    if(offset_ != null) {
        console.log('path: '+'/news/start/'+offset_+'?category='+category_+'&keyword='+keyword_)
        req.session.newsall = newsArr;
        req.session.newsCount = News.count;
        req.session.newsOffset = parseInt(req.params.start);
        res.redirect('/news/start/'+offset_+'?category='+category_+'&keyword='+keyword_);
    } else {
        req.session.latestNews = newsArr;
        res.redirect('/');
    }

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
