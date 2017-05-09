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
};/**
 * Created by kjtdi on 5/9/2017.
 */

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
