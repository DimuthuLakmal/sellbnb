/**
 * Created by kjtdi on 2/8/2017.
 */
//set rating to hidden input rating

imgDataArr = [];
$('#bidformToSubmit').submit(function (e) {
  e.preventDefault();

  var data = {};
  $('#bidformToSubmit').serializeArray().forEach(function (d) {
    data[d['name']] = d['value'];
  });

  if(data['userId']){
    $('#message_pending').show();
    $.ajax({
      url: "/api/offer/add",
      type: 'POST',
      data: data,
      success: function (data, status, xhr) {
        if (status == 'success') {
          $('#message_pending').hide();
          $('#message_success').show();
        }
      }
    });
  } else {
    $.ajax({
      url: '/need_auth?returnTo=%2Fitems%2Fname%2F' + data['item_url_code'],
      type: 'GET',
      data: {
        listingPage: true,
        yourOffer: data['offerPrice'],
        quantity: data['quantity'],
        desPort: data['destPort'],
        note: data['buyerNote']
      },
      success : function (data) {
        window.location.replace(data.redirectTo);
      }
    })
  }

});

function readFile(file) {
  var FR = new FileReader();

  FR.addEventListener("load", function (e) {
    imgDataArr.push({
      filename: file.name,
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
