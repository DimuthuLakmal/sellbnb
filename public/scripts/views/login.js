var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

$(document).ready(function () {

    var action = getUrlParameter("action");
    var isClicked = false;

    if(action == "signup" && !isClicked) {
        setTimeout(function () {
            $('#tab_2').click();
            isClicked = true;
        }, 500);
    }
});

$('#registerButton').click(function (e) {
    e.preventDefault();
    var isValidRegistration = true;
    if($('#reg_password').val().length < 8) {
        $('#passwordmatchError').text('Password should consists of atleast 8 characters');
        $('#passwordmatchError').show();
        isValidRegistration = false;
    }
    if($('#reg_password').val() != $('#reg_password2').val()) {
        $('#passwordmatchError').text('Password & Re-password didn\'t match.');
        $('#passwordmatchError').show();
        isValidRegistration = false;
    }
    if(!isEmail($('#reg_email').val())){
        $('#passwordmatchError').text('Email is not valid.');
        $('#passwordmatchError').show();
        isValidRegistration = false;
    }
    if(isValidRegistration) {
        $('#registerForm').submit();
    }
});

$('#reg_password').keypress(function (e) {
    $('#passwordmatchError').hide();
});

$('#reg_email').keypress(function (e) {
    $('#passwordmatchError').hide();
});
