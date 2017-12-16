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


//update item details page
var images = [];
var parameters = [];
//handle image upload button click
$("#fileToUpload").change(function(event){
    if (this.files && this.files[0]) {
        var reader = new FileReader();

        //set image to preview
        reader.onload = function (e) {
            $('#imagepreview-div').append('<div class="two columns">'+
                '<img src="'+e.target.result+'"'+
                'style="width: 120px; height: 120px" id="blah"/>'+
                '<a href="#">(Remove)</a>'+
                '</div>');
        }

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
    var itemId = $('#itemId').val();
    var packingType = $('#packing_type').val();
    var paymentTerms = $('#payment_terms').val();
    var suggestedPrice = $('#priceUnit').val()+" "+$('#suggested_price').val();
    var sellerNote = $('#seller_note').val();
    var hours = $('#hours').val();
    var days = $('#days').val();
    var mins = $('#mins').val();
    var duration = parseInt(days) * 24 * 3600 + parseInt(hours) * 3600 + parseInt(mins) * 60;

    $.ajax({url: "/api/items/update",
        type: 'POST',
        data: {title:title, quantity: quantity, deliveryBy: deliveryBy, warehouseId: warehouseId, itemId: itemId,
            images: images, duration: duration, packingType: packingType,paymentTerms: paymentTerms,
            suggestedPrice: suggestedPrice, sellerNote: sellerNote},
        success: function(data, status, xhr) {
            if(status == 'success') {
                $('#message_success').show();
            }
        }
    });
});

