let express = require('express');
let _ = require('lodash');
let router = express.Router();
let models = require('./../models');
let sequelize = models.sequelize;
let fs = require('fs');
let path = require('path');

/* Add news to database. */
router.post('/addnews', function (req, res) {
  //retrieve data from req object
  let userId = req.body.userId;
  let title = req.body.title;
  let old_title = req.body.old_title;
  let category = req.body.category;
  let language = req.body.language;
  let news_content = req.body.news_content;
  let keywords = req.body.keywords;
  let summary = req.body.summary;

  if (old_title != "Select News Title") {
    let newId = old_title;

    let newsObject = {};
    if (language == "English") {
      newsObject = {
        english_title: title,
        english_content: news_content,
        english_summary: summary,
        UserId: userId,
      }
    } else if (language == "Sinhala") {
      newsObject = {
        sinhala_title: title,
        sinhala_content: news_content,
        sinhala_summary: summary,
        UserId: userId,
      }
    } else if (language == "Tamil") {
      newsObject = {
        tamil_title: title,
        tamil_content: news_content,
        tamil_summary: summary,
        UserId: userId,
      }
    }

    models.News.update(
      newsObject,
      {where: {id: newId}}
    ).then(function (results) {
      res.sendStatus(200);
    });
  } else {

    //write images to image files
    _.forEach(req.body.images, function (image, index) {
      let imageBuffer = decodeBase64Image(image.data); //decoding base64 images
      fs.writeFile('public/uploads/news/' + image.filename, imageBuffer.data, function (err) {
        console.log(err);
      });
    });

    let imageURL = req.body.images[req.body.images.length - 1].filename;

    let newsObject = {};
    if (language == "English") {
      newsObject = {
        english_title: title,
        category: category,
        english_content: news_content,
        english_summary: summary,
        hits: 0,
        thumbnail: imageURL,
        keywords: keywords,
        UserId: userId,
      }
    } else if (language == "Sinhala") {
      newsObject = {
        sinhala_title: title,
        category: category,
        sinhala_content: news_content,
        sinhala_summary: summary,
        hits: 0,
        thumbnail: imageURL,
        keywords: keywords,
        UserId: userId,
      }
    } else if (language == "Tamil") {
      newsObject = {
        tamil_title: title,
        category: category,
        tamil_content: news_content,
        tamil_summary: summary,
        hits: 0,
        thumbnail: imageURL,
        keywords: keywords,
        UserId: userId,
      }
    }
    //store news in database
    sequelize.sync().then(
      function () {
        let News = models.News;
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

/* Add Images of News*/
/* Used in addnews page */
router.post('/addimages', function (req, res, next) {
  let totalImages = req.body.images.length;
  _.forEach(req.body.images, function (image, index) {
    let imageBuffer = decodeBase64Image(image.data); //decoding base64 images
    fs.writeFile('public/uploads/news/images/' + image.filename, imageBuffer.data, function (err) {
      console.log(err);
    });
    if ((index + 1) == totalImages) {
      res.sendStatus(200);
    }
  });
});

/* Add news to database. */
router.get('/titles', function (req, res) {

  //store news in database
  sequelize.sync().then(
    function () {
      let News = models.News;
      let User = models.User;
      News.findAll({
        attributes: ['id', 'english_title'],
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
  let name = req.body.name;
  let email = req.body.email;
  let comment = req.body.comment;
  let NewsId = req.body.NewsId;

  //store news in database
  sequelize.sync().then(
    function () {
      let Comment = models.Comment;
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

  res.redirect('/news/id/' + NewsId);
});

/* Retrieve news from database */
/* Usage: use to market news button in header. Also use to keyword search and category news searches*/
router.get('/start/:start', function (req, res) {
  let keyword = req.query['keyword'];
  let category = req.query['category'];
  let start = req.params.start;

  let whereObject = {};
  let isFromOtherPage = true;
  if (keyword !== 'all' && category === 'all') {
    whereObject = {keywords: {$like: '%' + keyword.toLowerCase() + '%'}};
    isFromOtherPage = false;
  } else if (keyword === 'all' && category !== 'all') {
    whereObject = {category: [category]};
    isFromOtherPage = false;
  } else if (keyword === 'all' && category === 'all') {
    whereObject = {category: [category]};
    //retrieve data from req object
    sequelize.sync().then(
      function () {
        let News = models.News;
        let User = models.User;
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

  if (!isFromOtherPage) {
    //retrieve data from req object
    sequelize.sync().then(
      function () {
        let News = models.News;
        let User = models.User;
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
      let News = models.News;
      let User = models.User;
      News.findAndCountAll({
        limit: 3,
        include: [User],
        order: '`hits` DESC'
      }).then(function (News) {
        let newsArr = [];
        //pushing retrieved data to newsArr
        _.forEach(News.rows, function (news, index) {
          let id = news.id;
          let title = news.english_title;
          let category = news.category;
          let createdAt = news.createdAt;
          let thumbnail = news.thumbnail;

          //mapping month
          let dateComponents = createdAt.toString().split(" ");
          let dateOfNews = dateComponents[2];
          let monthOfNews = dateComponents[1];
          let yearOfNews = dateComponents[3];

          newsArr.push({
            'id': id, 'title': title, 'category': category,
            'date': dateOfNews, 'month': monthOfNews, 'year': yearOfNews, 'thumbnail': thumbnail
          });
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
      let News = models.News;
      let User = models.User;
      News.findAndCountAll({
        limit: 3,
        include: [User],
        order: '`createdAt` DESC'
      }).then(function (News) {
        let newsArr = [];
        //pushing retrieved data to newsArr
        _.forEach(News.rows, function (news, index) {
          let id = news.id;
          let title = news.english_title;
          let category = news.category;
          let createdAt = news.createdAt;
          let thumbnail = news.thumbnail;

          //mapping month
          let dateComponents = createdAt.toString().split(" ");
          let dateOfNews = dateComponents[2];
          let monthOfNews = dateComponents[1];
          let yearOfNews = dateComponents[3];

          newsArr.push({
            'id': id, 'title': title, 'category': category,
            'date': dateOfNews, 'month': monthOfNews, 'year': yearOfNews, thumbnail: thumbnail
          });
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
      let News = models.News;
      let User = models.User;
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
      let News = models.News;
      let User = models.User;
      let Comment = models.Comment;

      let newsId = req.params.id;
      News.findAll({
        where: {id: newsId},
        include: [User, Comment],
      }).then(function (returnNews) {
        if (returnNews[0]) {
          let news = returnNews[0].dataValues;

          let title = '';
          let content = '';
          if (req.query['lan'] == 'en') {
            title = news.english_title;
            content = news.english_content;
          } else if (req.query['lan'] == 'sn') {
            title = news.sinhala_title;
            content = news.sinhala_content;
          } else if (req.query['lan'] == 'tm') {
            title = news.tamil_title;
            content = news.tamil_content;
          }
          let id = news.id;
          let category = news.category;
          let hits = news.hits;
          let user = news.User.full_name;

          let createdAt = news.createdAt;
          let paragraphs = [];

          //extracting paragraphs,image by removing <p> tags and <img> tags
          let img = content.substring(content.indexOf('src="', content.indexOf("<img")) + 5
            , content.indexOf('"', content.indexOf('src=\"') + 5));

          //mapping month
          let dateComponents = createdAt.toString().split(" ");
          let dateOfNews = dateComponents[2];
          let monthOfNews = dateComponents[1];
          let yearOfNews = dateComponents[3];

          req.session.specificNews = {
            'id': id, 'title': title, 'category': category, 'img': img,
            'hits': hits, 'user': user, 'date': dateOfNews,
            'month': monthOfNews, 'year': yearOfNews, comments: news.Comments
          };

          let News = models.News;
          News.update(
            {hits: (parseInt(hits) + 1)},
            {where: {id: id}}
          ).then(function (results) {
            res.redirect('/news/id/' + newsId + '?lan=' + req.query['lan']);
          });
        }
      });
    }
  );
});

/* Retrieve specific news and its comments from database */
router.get('/news_id/:news_id', function (req, res) {
  //retrieve data from req object
  // console.log('visited');
  sequelize.sync().then(
    function () {
      let News = models.News;
      let User = models.User;
      let Comment = models.Comment;

      let newsId = req.params.news_id;
      News.findAll({
        where: {id: newsId},
        include: [User, Comment],
      }).then(function (News) {
        let news = News[0].dataValues;

        let title = '';
        let content = '';
        if (req.query['lan'] == 'en') {
          title = news.english_title;
          content = news.english_content;
        } else if (req.query['lan'] == 'sn') {
          title = news.sinhala_title;
          content = news.sinhala_content;
        } else if (req.query['lan'] == 'tm') {
          title = news.tamil_title;
          content = news.tamil_content;
        }

        //extracting paragraphs,image by removing <p> tags and <img> tags
        if (content.indexOf('<img') != -1) {
          let imgToReplace = content.substring(content.indexOf('<img')
            , content.indexOf('>', content.indexOf('<img')) + 1);
          let removedImageContent = content.replace(imgToReplace, "");
        } else {
          let removedImageContent = content;
        }

        if (content.indexOf('<table') != -1) {
          let tableToReplace = removedImageContent.substring(removedImageContent.indexOf('<table')
            , removedImageContent.indexOf('>', removedImageContent.indexOf('<table')) + 1);
          console.log(tableToReplace);
          let removedTableContent = removedImageContent.replace(tableToReplace, '<table class="basic-table">');
        } else {
          let removedTableContent = removedImageContent;
        }

        let newsContent = {removedTableContent: removedTableContent};

        res.jsonp(newsContent);
      });
    }
  );
});

//Construct NewsArray from retrieved data from db and redirect
function newsArray(News, offset, req, res, category, keyword) {
  // console.log('Visited');
  let newsArr = [];
  // let language = req.session.language;

  _.forEach(News.rows, function (news) {
    // let content = '';
    // let title = '';
    let has_sinhala_content = false;
    let has_tamil_content = false;
    if (news.sinhala_content != "" && news.sinhala_content != null) {
      has_sinhala_content = true;
    } else if (news.tamil_content != "" && news.tamil_content != null) {
      has_tamil_content = true;
    }

    // if(content != null && content != '') {
    let id = news.id;
    let category = news.category;
    let hits = news.hits;
    let user = news.User.full_name;
    let createdAt = news.createdAt;
    let content = news.english_content;
    let title = news.english_title;
    let summary = news.english_summary;

    //removing <p> tags and <img> tags and extract image
    let removedImage = content;
    let img = '';
    while (removedImage.indexOf('<img') != -1) {
      if (removedImage.indexOf('<img') != -1) {
        if (img == '') {
          img = removedImage.substring(removedImage.indexOf('src="', removedImage.indexOf("<img")) + 5
            , removedImage.indexOf('"', removedImage.indexOf('src=\"') + 5));
        }
        let imgToReplace = removedImage.substring(removedImage.indexOf('<img')
          , removedImage.indexOf('>', removedImage.indexOf('<img')) + 1);
        removedImage = removedImage.replace(imgToReplace, "");
      }
    }

    if (content.indexOf('<table') != -1) {
      let tableToReplace = removedImage.substring(removedImage.indexOf('<table')
        , removedImage.indexOf('</table>'));
      let removedTable = removedImage.replace(tableToReplace, "");
    } else {
      let removedTable = removedImage;
    }

    let removedBlankPara = removedTable;
    while (removedBlankPara.indexOf('<p></p>') != -1) {
      if (removedBlankPara.indexOf('<p></p>') != -1) {
        removedBlankPara = removedBlankPara.replace('<p></p>', "");
      }
    }

    while (removedBlankPara.indexOf('<p>&nbsp;</p>') != -1) {
      if (removedBlankPara.indexOf('<p>&nbsp;</p>') != -1) {
        removedBlankPara = removedBlankPara.replace('<p>&nbsp;</p>', "");
      }
    }

    //mapping month
    let dateComponents = createdAt.toString().split(" ");
    let dateOfNews = dateComponents[2];
    let monthOfNews = dateComponents[1];
    let yearOfNews = dateComponents[3];

    newsArr.push({
      'id': id,
      'title': title,
      'category': category,
      'img': img,
      'hits': hits,
      'content': removedBlankPara,
      'summary': summary,
      'user': user,
      'date': dateOfNews,
      'month': monthOfNews,
      'year': yearOfNews,
      'has_sinhala_content': has_sinhala_content,
      'has_tamil_content': has_tamil_content
    });
    // }
  });
  let offset_ = offset;
  let category_ = category;
  let keyword_ = keyword;
  if (offset_ != null) {
    console.log('path: ' + '/news/start/' + offset_ + '?category=' + category_ + '&keyword=' + keyword_)
    req.session.newsall = newsArr;
    req.session.newsCount = News.count;
    req.session.newsOffset = parseInt(req.params.start);
    res.redirect('/news/start/' + offset_ + '?category=' + category_ + '&keyword=' + keyword_);
  } else {
    req.session.latestNews = newsArr;
    res.redirect('/');
  }

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
