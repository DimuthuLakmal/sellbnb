/**
 * Created by kjtdi on 2/10/2017.
 */
$(document).ready(function() {
    $("#from").datepicker();
    $("#to").datepicker();
});


//open models for accept bids
$('.item-selling-btn').click(function () {
    var id = $(this).prev().val();
    console.log($(this).parent().children(':first-child').text());
    $(this).parent().children(':first-child').click();
});

//open models for accept bids
$('.bidding-accept-btn').click(function () {
    var id = $(this).prev().prev().val();
    $(this).parent().children('a').each(function () {
        $(this).click();
    });
});

