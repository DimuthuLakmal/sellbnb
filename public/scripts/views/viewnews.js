var getLanParameter = function getLanParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sNewIdURLParameters = window.location.href.split("/")[5].split("?"),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return [sParameterName[1] === undefined ? true : sParameterName[1],sNewIdURLParameters];
        }
    }
};

$(document).ready(function () {

    var parameters = getLanParameter("lan");
    var language = parameters[0];
    var newsId = parameters[1];

    console.log("/api/news/news_id/"+newsId[0]+"?lan="+language);

    jQuery.ajax({
        type: "GET",
        dataType: 'jsonp',
        url: "/api/news/news_id/"+newsId[0]+"?lan="+language,
        success: function (obj, textstatus) {
            //populating news by creating dynamic <li>'s
            console.log(obj.removedTableContent);
            $('#news_content_div').append(obj.removedTableContent);

            // $.each(obj, function (index, news) {
            //     var imgSrc = 'uploads/news/'+news.thumbnail;
            //     if(news.thumbnail ==  null) {
            //         imgSrc = 'images/small_product_list_01.jpg';
            //     }
            //     $('#popular_news').append('<li>' +
            //         '<div class="widget-thumb">' +
            //         '<a href="/news/id/'+news.id+'?lan=en"><img src=\"'+imgSrc+'\" alt="" width="90"  height="90"/></a>' +
            //         '</div>' +
            //         '<div class="widget-text">' +
            //         '<h4><a href="/news/id/'+news.id+'?lan=en">'+news.title+'</a></h4>' +
            //         '<span>'+news.date+' '+news.month+' '+news.year+'</span>' +
            //         '</div>' +
            //         '<div class="clearfix"></div>' +
            //         '</li>');
            // });
        }
    });

    //ajax request for retrieve popular news for sidebar
    jQuery.ajax({
        type: "GET",
        dataType: 'jsonp',
        url: "/api/news/viewpopular",
        success: function (obj, textstatus) {
            //populating news by creating dynamic <li>'s
            $.each(obj, function (index, news) {
                var imgSrc = 'uploads/news/'+news.thumbnail;
                if(news.thumbnail ==  null) {
                    imgSrc = 'images/small_product_list_01.jpg';
                }
                $('#popular_news').append('<li>' +
                    '<div class="widget-thumb">' +
                    '<a href="/news/id/'+news.id+'?lan=en"><img src=\"'+imgSrc+'\" alt="" width="90"  height="90"/></a>' +
                    '</div>' +
                    '<div class="widget-text">' +
                    '<h4><a href="/news/id/'+news.id+'?lan=en">'+news.title+'</a></h4>' +
                    '<span>'+news.date+' '+news.month+' '+news.year+'</span>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                    '</li>');
            });
        }
    });

    //ajax request for retrieve recent news for sidebar
    jQuery.ajax({
        type: "GET",
        dataType: 'jsonp',
        url: "/api/news/viewrecent",
        success: function (obj, textstatus) {
            //populating news by creating dynamic <li>'s
            $.each(obj, function (index, news) {
                var imgSrc = 'uploads/news/'+news.thumbnail;
                if(news.thumbnail ==  null) {
                    imgSrc = 'images/small_product_list_01.jpg';
                }
                $('#recent_news').append('<li>' +
                    '<div class="widget-thumb">' +
                    '<a href="/news/id/'+news.id+'?lan=en"><img src=\"'+imgSrc+'\" alt="" width="90"  height="90"/></a>' +
                    '</div>' +
                    '<div class="widget-text">' +
                    '<h4><a href="/news/id/'+news.id+'?lan=en">'+news.title+'</a></h4>' +
                    '<span>'+news.date+' '+news.month+' '+news.year+'</span>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                    '</li>');
            });
        }
    });

    //ajax request for retrieve recent news for sidebar
    jQuery.ajax({
        type: "GET",
        dataType: 'jsonp',
        url: "/api/commodity/families",
        success: function (obj, textstatus) {
            //populating families in right side bar
            $.each(obj, function (index, family) {
                $('#family_list').append('<li><a href="/api/news/viewall/start/0/category/'+family.DISTINCT+'">'+family.DISTINCT+'</a></li>');
            });
        }
    });
});