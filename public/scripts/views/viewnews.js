$(document).ready(function () {
    //ajax request for retrieve popular news for sidebar
    jQuery.ajax({
        type: "GET",
        dataType: 'jsonp',
        url: "http://ec2-35-154-154-55.ap-south-1.compute.amazonaws.com:3000/api/news/viewpopular",
        success: function (obj, textstatus) {
            //populating news by creating dynamic <li>'s
            $.each(obj, function (index, news) {
                var imgSrc = '';
                if(news.category == 'Delete') {
                    imgSrc = 'images/categories/tea.png';
                } else if (news.category == 'Stop Bidding') {
                    imgSrc = 'images/categories/rubber.jpg';
                } else {
                    imgSrc = "images/categories/coconut.png";
                }
                $('#popular_news').append('<li>' +
                    '<div class="widget-thumb">' +
                    '<a href="http://ec2-35-154-154-55.ap-south-1.compute.amazonaws.com:3000/news/id/'+news.id+'"><img src=\"'+imgSrc+'\" alt="" width="90"  height="90"/></a>' +
                    '</div>' +
                    '<div class="widget-text">' +
                    '<h4><a href="http://ec2-35-154-154-55.ap-south-1.compute.amazonaws.com:3000/news/id/'+news.id+'">'+news.title+'</a></h4>' +
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
        url: "http://ec2-35-154-154-55.ap-south-1.compute.amazonaws.com:3000/api/news/viewrecent",
        success: function (obj, textstatus) {
            //populating news by creating dynamic <li>'s
            $.each(obj, function (index, news) {
                var imgSrc = '';
                if(news.category == 'Delete') {
                    imgSrc = 'images/categories/tea.png';
                } else if (news.category == 'Stop Bidding') {
                    imgSrc = 'images/categories/rubber.jpg';
                } else {
                    imgSrc = "images/categories/coconut.png";
                }
                $('#recent_news').append('<li>' +
                    '<div class="widget-thumb">' +
                    '<a href="http://ec2-35-154-154-55.ap-south-1.compute.amazonaws.com:3000/news/id/'+news.id+'"><img src=\"'+imgSrc+'\" alt="" width="90"  height="90"/></a>' +
                    '</div>' +
                    '<div class="widget-text">' +
                    '<h4><a href="http://ec2-35-154-154-55.ap-south-1.compute.amazonaws.com:3000/news/id/'+news.id+'">'+news.title+'</a></h4>' +
                    '<span>'+news.date+' '+news.month+' '+news.year+'</span>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                    '</li>');
            });
        }
    });
});