/**
 * Created by kjtdi on 1/28/2017.
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

    var name = $('#name').val();
    var segment = $('#segment').val();
    var family = $('#family').val();
    var classOfCommodity = $('#class').val();
    var measureUnit = $('#measure_unit').val();
    var priceUnit = $('#price_unit').val();
    var specification = $('#specification').val();
    var alternativeNames = $('#alternative_names').val().split(',');
    var measureUnits = $('#alternative_names').val().split(',');
    var priceUnits = priceUnit.split(',');
    var packingType = $('#packing_type').val().split(',');

    $.ajax({url: "/api/commodity/add",
        type: 'POST',
        data: {name: name, segment: segment, family: family, classOfCommodity: classOfCommodity,measureUnit: measureUnit,
            specification: specification, images: images, alternativeNames: alternativeNames, parameters: parameters,
            measureUnits: measureUnits, priceUnits: priceUnits, packingType: packingType},
        success: function(data, status, xhr) {
            if(status == 'success') {
                $('#message_success').show();
            }
        }
    });
});

//handle add button
$('#submitparameter').click(function (e) {
    e.preventDefault();
    var parameter_name = $('#parameter_name').val();
    var parameter_value = $('#value').val();
    parameters.push(({parameter_name: parameter_name, parameter_value: parameter_value}));

    //append paramter data to parameter table
    $('#parameter-table-body').append('<tr>'+
        '<td align="center">'+parameter_name+'</td>'+
        '<td align="center">'+parameter_value+'</td>'+
        '<td align="center" style="display: none">'+(parameters.length-1)+'</td>'+
        '<td align="center"><a class="remove_parameter" style="color:#2db2ea;">Remove</a></td>'+
        '</tr>');

    //if parameter list has values table will be shown
    if(parameters.length == 1) {
        $('#parameter-table').show();
    }

    //reset inputs in parameter modal
    $('#parameter_name').val('');
    $('#value').val('');
    $('.mfp-close').click();
});

//handle remove anchor in parameter table
$('#parameter-table-body').on('click', 'a', function (e) {
    e.preventDefault();

    //find index of the element to remove and remove it from array
    var indexToRemove = $(this).parent().prev().text();
    parameters.splice(indexToRemove,1);
    $(this).parent().prev().parent().remove();

    //if parameter has no value, table will be hide
    if(parameters.length == 0) {
        $('#parameter-table').hide();
    }
});