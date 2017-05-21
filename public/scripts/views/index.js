$('#top_search').keyup(function () {
    var keyword = $(this).val();
    jQuery.ajax({
        type: "POST",
        dataType: 'jsonp',
        url: "/api/items/keyword",
        data: {keyword: keyword},
        success: function (obj, textstatus) {
            $('#searchresults').empty();
            //populating results to auto suggest drop down
            var items = obj[0];
            $.each(items, function (index, item) {
                $('#searchresults').append('<option value=\"'+item.title+'\">');
            });

            var commodities = obj[1];
            $.each(commodities, function (index, commodity) {
                $('#searchresults').append('<option value=\"'+commodity.name+'\">');
            });
        }
    });
});

$.get("https://ipinfo.io", function(response) {
    jQuery.ajax({
        type: "GET",
        dataType: 'jsonp',
        url: "/api/countries/code/"+response.country,
        success: function (obj, textstatus) {
            $('#flag_img').attr("src","images/flags/"+obj.flag);
        }
    });
}, "jsonp");
