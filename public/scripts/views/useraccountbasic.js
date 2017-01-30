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