/**
 * Created by kjtdi on 1/30/2017.
 */
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

    var quantity = $('#quantity').val();
    var title = $('#title').val();
    var deliveryBy = $('#delivery_by').val();
    var warehouseId = $('#warehouse').val();
    var commodityId = $('#commodityId').val();
    var userId = $('#userId').val();
    var packingType = $('#packing_type').val();
    var paymentTerms = $('#payment_terms').val();
    var suggestedPrice = $('#suggested_price').val();
    var sellerNote = $('#seller_note').val();
    var hours = $('#hours').val();
    var days = $('#days').val();
    var mins = $('#mins').val();
    var duration = parseInt(days) * 24 * 3600 + parseInt(hours) * 3600 + parseInt(mins) * 60;

    $.ajax({url: "http://ec2-35-154-154-55.ap-south-1.compute.amazonaws.com:3000/api/items/add",
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
//     $.ajax({url: "http://ec2-35-154-154-55.ap-south-1.compute.amazonaws.com:3000/api/user/view/warehouses",
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