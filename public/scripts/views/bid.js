/**
 * Created by kjtdi on 2/8/2017.
 */
//set rating to hidden input rating
$('#star1').click(function () {
    $('#rating').val('1');
});

$('#star2').click(function () {
    $('#rating').val('2');
});

$('#star3').click(function () {
    $('#rating').val('3');
});

$('#star4').click(function () {
    $('#rating').val('4');
});

$('#star5').click(function () {
    $('#rating').val('5');
});

//Showing delivery cost & date according to seller preference
$(document).ready(function () {
   if($('#item_delivery_by').text() == 'Buyer') {
        $('#buyer_delivery_cost').show();
        $('#buyer_delivery_date').show();
   };
});

function checkSelect() {
    console.log($('#delivery_by').val());
    if($('#delivery_by').val()=='Buyer') {
        $('#buyer_delivery_cost').show();
        $('#buyer_delivery_date').show();
    }
    if($('#delivery_by').val() == 'Seller') {
        $('#buyer_delivery_cost').hide();
        $('#buyer_delivery_date').hide();
    };
    setTimeout(checkSelect, 500);
}

// start the cycle
checkSelect();
