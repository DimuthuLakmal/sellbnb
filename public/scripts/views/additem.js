/**
 * Created by kjtdi on 1/30/2017.
 */
var images = [];
var parameters = [];

var $uploadCrop;

$(document).ready(function () {
   var itemPreviewed = JSON.parse(localStorage.getItem("previewItem"));
   var visitedPreview = localStorage.getItem("visitedPreview");

    if(visitedPreview == undefined || visitedPreview == null) {
        localStorage.setItem("visitedPreview", false);
    }
   if(itemPreviewed != undefined && itemPreviewed != null && visitedPreview == "true") {
       images = itemPreviewed.images;
       $.each(images, function(index, image) {
           $('#imagepreview-div').append('<div class="two columns">'+
               '<img src="'+image.data+'"'+
               'style="width: 120px; height: 120px" id="blah"/>'+
               '<a href="#">(Remove)</a>'+
               '</div>');
       });
       localStorage.setItem("visitedPreview", false);
   }

    $uploadCrop = $('#upload-demo').croppie({
        viewport: {
            width: 400,
            height: 400,
        },
    });
});

//handle image upload button click
$("#fileToUpload").change(function(event){
    if (this.files && this.files[0]) {
        var reader = new FileReader();

        //set image to preview
        reader.onload = function (e) {
            $uploadCrop.croppie('bind', {
                url: e.target.result,
                zoom: 5,
            }).then(function(){
                console.log('jQuery bind complete');
            });
        }

        $('#cropWindow').click();

        reader.readAsDataURL(this.files[0]);

        //pushing images to image array to sent to the server
        $.each(event.target.files, function(index, file) {
            reader = new FileReader();
            reader.onload = function(event) {
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
        $('#imagepreview-div').append('<div class="two columns">'+
            '<img src="'+resp+'"'+
            'style="width: 120px; height: 120px" id="blah"/>'+
            '<a href="#">(Remove)</a>'+
            '</div>');
        images[images.length-1].data = resp;
        $('.mfp-close').click();
    });
});

$('#commodity-uploadimage').click(function (e) {
    e.preventDefault();
    $('#fileToUpload').click();
});

//sending data to server using ajax
$('#submit').click(function (e) {
    e.preventDefault();

    var quantity = $('#quantity').val()+' '+$('#measureUnit').val();
    var title = $('#title').val();
    var deliveryBy = $('#delivery_by').val();
    var warehouseId = $('#warehouse').val();
    var commodityId = $('#commodityId').val();
    var userId = $('#userId').val();
    var packingType = $('#packing_type').val();
    var paymentTerms = $('#payment_terms').val();
    var suggestedPrice = $('#priceUnit').val().trim()+" "+$('#suggested_price').val().trim();
    var sellerNote = $('#seller_note').val();
    var hours = $('#hours').val();
    var days = $('#days').val();
    var mins = $('#mins').val();
    var duration = parseInt(days) * 24 * 3600 + parseInt(hours) * 3600 + parseInt(mins) * 60;

    // if(title == "") {
    //     title = $('#commodityName').val();
    // }

    $.ajax({url: "/api/items/add",
        type: 'POST',
        data: {title:title, quantity: quantity, deliveryBy: deliveryBy, warehouseId: warehouseId, commodityId: commodityId,
            userId: userId, images: images, duration: duration, packingType: packingType,paymentTerms: paymentTerms,
            suggestedPrice: suggestedPrice, sellerNote: sellerNote},
        success: function(data, status, xhr) {
            if(status == 'success') {
                $('#message_success').show();
            }
        }
    });
});

// $(document).ready(function () {
//     var userId = $('#userId').val();
//
//     $.ajax({url: "/api/user/view/warehouses",
//         type: 'POST',
//         data: {userId: userId},
//         success: function(data, status, xhr) {
//             $.each(data, function (index, warehouse) {
//                 var address = warehouse.warehouseAddress1;
//                 alert('A');
//                 //$('#warehouse').append('<option>'+address+'</option>');
//                 $('#warehouse')
//                     .append('<option>fasdffsd</option>');
//             });
//         }
//     });
// });

// jQuery.ajax({
//     type: "GET",
//     dataType: 'jsonp',
//     url: "http://ipinfo.io",
//     success: function (obj, textstatus) {
//         if(obj.country == 'LK') {
//             $("#suggested_price").val('LKR.');
//         } else {
//             $("#suggested_price").val('USD');
//         }
//     }
// });

//redirect to add warehouse
// $('#warehouse').change(function () {
//     alert('A');
// });

$('#add_warehouse').click(function(e){
    e.preventDefault();
    window.location = "/user/contact"
});

$('#preview').click(function (e) {

    e.preventDefault();
    var quantity = $('#quantity').val()+' '+$('#measureUnit').val();
    var title = $('#title').val();
    var deliveryBy = $('#delivery_by').val();
    var warehouse = $('#warehouse').text();
    var commodityId = $('#commodityId').val();
    var userId = $('#userId').val();
    var packingType = $('#packing_type').val();
    var paymentTerms = $('#payment_terms').val();
    var suggestedPrice = $('#priceUnit').val()+" "+$('#suggested_price').val();
    var sellerNote = $('#seller_note').val();
    var hours = $('#hours').val();
    var days = $('#days').val();
    var mins = $('#mins').val();

    var item = {quantity: quantity, title: title, deliveryBy: deliveryBy, warehouse: warehouse, commodityId: commodityId,
    userId: userId, packingType: packingType, paymentTerms:paymentTerms, suggestedPrice: suggestedPrice, sellerNote: sellerNote,
    hours: hours, days: days, mins: mins, images: images};

    localStorage.setItem('previewItem', JSON.stringify(item));

    if(images.length > 0) {
        $.ajax({url: "/api/items/preview",
            type: 'POST',
            data: {images: images},
            success: function(data, status, xhr) {
                if(status == 'success') {
                    window.location = "/items/preview";
                }
            }
        });
    } else {
        window.location = "/items/preview";
    }

})