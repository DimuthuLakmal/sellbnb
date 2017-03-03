/**
 * Created by kjtdi on 2/3/2017.
 */

//get search results for auto suggestion in top search bar
$('#top_search').keyup(function () {
    var keyword = $(this).val();
    jQuery.ajax({
        type: "POST",
        dataType: 'jsonp',
        url: "http://ec2-35-154-154-55.ap-south-1.compute.amazonaws.com:3000/api/items/keyword",
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