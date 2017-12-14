/**
 * Created by kjtdi on 2/8/2017.
 */
//set rating to hidden input rating

imgDataArr = [];

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
  if ($('#item_delivery_by').text() == 'Buyer') {
    $('#buyer_delivery_cost').show();
    $('#buyer_delivery_date').show();
  }
  ;
});

function checkSelect() {
  if ($('#delivery_by').val() == 'Seller') {
    $('#buyer_delivery_cost').show();
    $('#buyer_warehouse').show();
  }
  if ($('#delivery_by').val() == 'Buyer') {
    $('#buyer_delivery_cost').hide();
    $('#buyer_warehouse').hide();
  }
  ;
  setTimeout(checkSelect, 500);
}

$('#submit').click(function (e) {
  e.preventDefault();
  var last_bid = $('#last-bid-value').text().trim().split(" ")[1];
  var bidByUser = $('#your_bid').val();
  var suggested_price = $('#suggested_price').text().trim().split(" ")[1];

  if (parseFloat(bidByUser) > parseFloat(suggested_price)) {
    $('#error_message').hide();
    $('#submitFormBtn').click();
  } else {
    $('#error_message').show();
    $('#message_span').text('Your Bid Should higher than ' + $('#suggested_price').text() + " (Suggested Price By Seller)");
  }


});

$('#your_bid').keypress(function (e) {
  $('#error_message').hide();
});

// start the cycle
checkSelect();

function readFile(file) {
  var FR = new FileReader();

  FR.addEventListener("load", function (e) {
    imgDataArr.push({
      // filename: file.name,
      path: e.target.result
      // encoding: 'base64'
    });
  });

  FR.readAsDataURL(file);
}

$('#inputAtt').change(function () {
  $(this.files).each(function (i, f) {
    readFile(f);
  })
});

$('#add-comment').submit(function () {
  $('#imgData').val(JSON.stringify(imgDataArr));
});
