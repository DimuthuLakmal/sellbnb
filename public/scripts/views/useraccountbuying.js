/**
 * Created by Dimuthu on 4/14/2017.
 */
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

var getStartParameter = function getStartParameter() {
    var sPageURL = window.location.href ;
    var startVariables = sPageURL.split('/')[7].split("?")[0].split(",");
    return startVariables;
};

$(document).ready(function () {
    // setTimeout(function () {
    //     $('#tab_2').click();
    // }, 500);

    var openDurationOption = getUrlParameter('openDurationOption');
    var openPaginationOption = getStartParameter()[0];
    var pendingDurationOption = getUrlParameter('pendingDurationOption');
    var pendingPaginationOption = getStartParameter()[1];
    var cancelledDurationOption = getUrlParameter('cancelledDurationOption');
    var cancelledPaginationOption = getStartParameter()[2];

    var prevDurationOptionOpen = localStorage.getItem("prevDurationOptionOpenBuy");
    var prevPaginationOptionOpen = localStorage.getItem("prevPaginationOptionOpenBuy");
    var prevDurationOptionPending = localStorage.getItem("prevDurationOptionPendingBuy");
    var prevPaginationOptionPending = localStorage.getItem("prevPaginationOptionPendingBuy");
    var prevDurationOptionCancelled = localStorage.getItem("prevDurationOptionCancelledBuy");
    var prevPaginationOptionCancelled = localStorage.getItem("prevPaginationOptionCancelledBuy");

    if(prevDurationOptionOpen == null || prevDurationOptionOpen == undefined) {
        localStorage.setItem("prevDurationOptionOpenBuy", openDurationOption);
        localStorage.setItem("prevPaginationOptionOpenBuy", openPaginationOption);
    } else {
        localStorage.setItem("prevDurationOptionOpenBuy", openDurationOption);
        localStorage.setItem("prevPaginationOptionOpenBuy", openPaginationOption);
        if(openDurationOption != prevDurationOptionOpen || openPaginationOption != prevPaginationOptionOpen) {
            setTimeout(function () {
                $('#tab_1').click();
            }, 500);
        }
    }

    if(prevDurationOptionPending == null || prevDurationOptionPending == undefined) {
        localStorage.setItem("prevDurationOptionPendingBuy", pendingDurationOption);
        localStorage.setItem("prevPaginationOptionPendingBuy", pendingPaginationOption);
    } else {
        localStorage.setItem("prevDurationOptionPendingBuy", pendingDurationOption);
        localStorage.setItem("prevPaginationOptionPendingBuy", pendingPaginationOption);
        if(pendingDurationOption != prevDurationOptionPending || pendingPaginationOption != prevPaginationOptionPending) {
            setTimeout(function () {
                $('#tab_2').click();
            }, 500);
        }
    }

    if(prevDurationOptionCancelled == null || prevDurationOptionCancelled == undefined) {
        localStorage.setItem("prevDurationOptionCancelledBuy", cancelledDurationOption);
        localStorage.setItem("prevPaginationOptionCancelledBuy", cancelledPaginationOption);
    } else {
        localStorage.setItem("prevDurationOptionCancelledBuy", cancelledDurationOption);
        localStorage.setItem("prevPaginationOptionCancelledBuy", cancelledPaginationOption);
        if(cancelledDurationOption != prevDurationOptionCancelled || cancelledPaginationOption != prevPaginationOptionCancelled) {
            setTimeout(function () {
                $('#tab_3').click();
            }, 500);
        }
    }

    $('#filter_options_open').change(function () {
        $('#open_duration_form').submit();
    });

    $('#filter_options_pending').change(function () {
        $('#pending_duration_form').submit();
    });
});
