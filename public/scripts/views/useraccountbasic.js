/**
 * Created by kjtdi on 1/24/2017.
 */

//password validation frontend
$('#submitpassword').click(function (e) {
    e.preventDefault();
    if($('#newpassword').val() != $('#newrepassword').val()) {
        $('#passwordErrorMessage').show();
    } else {
        $('#passwordErrorMessage').hide();
        $('#passwordChangeForm').submit();
    }
});

//fullname validation frontend
$('#submitfullname').click(function (e) {
    e.preventDefault();
    if($('#newfullname').val() == '') {
        $('#fullnameErrorMessage').show();
    } else {
        $('#fullnameErrorMessage').hide();
        $('#fullnameChangeForm').submit();
    }
});

//company name validation frontend
$('#submitcompanyname').click(function (e) {
    e.preventDefault();
    if($('#newcompanyname').val() == '') {
        $('#companynameErrorMessage').show();
    } else {
        $('#companynameErrorMessage').hide();
        $('#companynameChangeForm').submit();
    }
});

//location validation frontend
$('#submitlocation').click(function (e) {
    e.preventDefault();
    if($('#newaddress1').val() == '') {
        $('#locationErrorMessage').show();
    } else {
        $('#locationErrorMessage').hide();
        $('#locationChangeForm').submit();
    }
});

$('#upload_image').click(function () {
    $('#fileToUpload').click();
});

var images = [];

//handle image upload button click
$("#fileToUpload").change(function(event){
    if (this.files && this.files[0]) {
        var reader = new FileReader();
        var userId = $('#userId').val();

        //set image to preview
        reader.onload = function (e) {
            var imagelink = e.target.result
            $('#profile_pic').attr("src",imagelink);
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

                $.ajax({url: "/api/user/profile_pic",
                    type: 'POST',
                    data: {userId: userId, images: images},
                    success: function(data, status, xhr) {
                        if(status == 'success') {

                        }
                    }
                });
            };
            reader.readAsDataURL(file);
        });
    }
});