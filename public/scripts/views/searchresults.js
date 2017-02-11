/**
 * Created by kjtdi on 2/6/2017.
 */
$('.class_check_box').click(function () {
    $(this).parent().submit();
});

// Filter by Price
//----------------------------------------//

$( "#slider-range" ).slider({
    range: true,
    min: 0,
    max: $('#maxPrice').val(),
    values: [ parseFloat($('#startPrice').val()), parseFloat($('#endPrice').val()) ],
    slide: function( event, ui ) {
        event = event;
        $( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
        $('#startPrice').val(ui.values[ 0 ]);
        $('#endPrice').val(ui.values[ 1 ]);
    }
});
$( "#amount" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ) +
    " - $" + $( "#slider-range" ).slider( "values", 1 ) );


$('#priceFilterButton').click(function () {
    $('#priceFilterForm').submit();
})