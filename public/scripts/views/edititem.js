/**
 * Created by kjtdi on 1/30/2017.
 */
var images = [];
var parameters = [];

var $uploadCrop;

$(document).ready(function () {
  var itemPreviewed = JSON.parse(localStorage.getItem("previewItem"));
  var visitedPreview = localStorage.getItem("visitedPreview");

  if (visitedPreview == undefined || visitedPreview == null) {
    localStorage.setItem("visitedPreview", false);
  }
  if (itemPreviewed != undefined && itemPreviewed != null && visitedPreview == "true") {
    images = itemPreviewed.images;
    $.each(images, function (index, image) {
      $('#imagepreview-div').append('<div class="two columns">' +
        '<img src="' + image.data + '"' +
        'style="width: 120px; height: 120px" id="blah"/>' +
        '<span style="display: none">' + index + '</span>' +
        '<a class="remove-btn">(Remove)</a>' +
        '</div>');
    });
    localStorage.setItem("visitedPreview", false);
  }

  $uploadCrop = $('#croppie-container').croppie({
    enableExif: true,
    viewport: {
      width: 300,
      height: 300,
      type: 'square'
    },
    boundary: {
      width: 300,
      height: 300
    }
  });
});

//handle image upload button click
$("#fileToUpload").change(function (event) {

  if (this.files && this.files[0]) {

    $('#croppie-container').show();
    $('#crop-btn').show();
    $('#commodity-uploadimage').text('Select Another Image');

    var reader = new FileReader();

    //set image to preview
    reader.onload = function (e) {
      $uploadCrop.croppie('bind', {
        url: e.target.result,
        zoom: 5
      }).then(function () {
      });
    };

    reader.readAsDataURL(this.files[0]);

    //pushing images to image array to sent to the server
    $.each(event.target.files, function (index, file) {
      reader = new FileReader();
      reader.onload = function (event) {
        object = {};
        object.filename = file.name;
        object.data = event.target.result;
        images.push(object);
      };
      reader.readAsDataURL(file);
    });
  }
});

$('#crop-btn').click(function () {
  $uploadCrop.croppie('result', {
    type: 'base64',
    size: 'viewport'
  }).then(function (resp) {
    $('#imagepreview-div').append('<div class="two columns">' +
      '<img src="' + resp + '"' +
      'style="width: 120px; height: 120px"/>' +
      '<span style="display: none">' + images.length + '</span>' +
      '<a class="remove-btn">(Remove)</a>' +
      '</div>');
    images[images.length - 1].data = resp;
    $('.mfp-close').click();
  });
});

$('#commodity-uploadimage').click(function (e) {
  e.preventDefault();
  $('#fileToUpload').click();
});

$('#open-uploadimage-modal').click(function (e) {
  e.preventDefault();
  $('#cropWindow').click();
  $('#croppie-container').hide();
  $('#crop-btn').hide();
  $('#commodity-uploadimage').text('Select Image');
});

//sending data to server using ajax
$('#submit').click(function (e) {

  e.preventDefault();

  var htmlValues = tinyMCE.get('editor').getContent();
  $('#comDesc').val(htmlValues);

  var quantity = $('#quantity').val() + ' ' + $('#measureUnit').val();

  var data = {};
  $('#addItemForm').serializeArray().forEach(function (d) {
    data[d['name']] = d['value'];
  });
  data['images'] = images;

  $.ajax({
    url: "/api/items/update",
    type: 'POST',
    data: data,
    success: function (data, status, xhr) {
      if (status == 'success') {
        $('#message_success').show();
      }
    }
  });
});

$('#add_warehouse').click(function (e) {
  e.preventDefault();
  window.location = "/user/contact"
});

$('#preview').click(function (e) {

  e.preventDefault();
  var quantity = $('#quantity').val() + ' ' + $('#measureUnit').val();
  var title = $('#title').val();
  var deliveryBy = $('#delivery_by').val();
  var warehouse = $('#warehouse').text();
  var commodityId = $('#commodityId').val();
  var userId = $('#userId').val();
  var packingType = $('#packing_type').val();
  var paymentTerms = $('#payment_terms').val();
  var suggestedPrice = $('#priceUnit').val() + " " + $('#suggested_price').val();
  var sellerNote = $('#seller_note').val();
  var hours = $('#hours').val();
  var days = $('#days').val();
  var mins = $('#mins').val();

  var item = {
    quantity: quantity,
    title: title,
    deliveryBy: deliveryBy,
    warehouse: warehouse,
    commodityId: commodityId,
    userId: userId,
    packingType: packingType,
    paymentTerms: paymentTerms,
    suggestedPrice: suggestedPrice,
    sellerNote: sellerNote,
    hours: hours,
    days: days,
    mins: mins,
    images: images
  };

  localStorage.setItem('previewItem', JSON.stringify(item));

  if (images.length > 0) {
    $.ajax({
      url: "/api/items/preview",
      type: 'POST',
      data: {images: images},
      success: function (data, status, xhr) {
        if (status == 'success') {
          window.location = "/items/preview";
        }
      }
    });
  } else {
    window.location = "/items/preview";
  }

});

$(".remove-btn").live('click', function () {
  $(this).parent().remove();
  images.splice(parseInt($(this).prev().text()), 1);
});
