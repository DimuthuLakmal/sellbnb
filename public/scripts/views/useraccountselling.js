/**
 * Created by kjtdi on 2/9/2017.
 */

// $(document).ready(function() {
//     $("#from").datepicker({ dateFormat: 'yy-mm-dd' });
//     $("#to").datepicker({ dateFormat: 'yy-mm-dd' });
// });
//
// //trigger when user select an action from drop down.
// $('.actions').change(function() {
//     var action = $(this).val();
//     $('#action-modal').click();
//
//     $('#action-heading').text(action);
//
//     if(action == 'Delete') {
//         $('#action-description').text('Are you want to delete this listing?');
//         $('#actionToSubmit').val('delete');
//     } else if(action == 'Stop Bidding') {
//         $('#action-description').text('Are you want to stop the bidding for this item?');
//         $('#actionToSubmit').val('stopbidding');
//     } else if(action == 'Cancel') {
//         $('#action-description').text('Are you want to cancel the bidding for this item?');
//         $('#actionToSubmit').val('cancelled');
//     }
// });

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

    var prevDurationOptionOpen = localStorage.getItem("prevDurationOptionOpen");
    var prevPaginationOptionOpen = localStorage.getItem("prevPaginationOptionOpen");
    var prevDurationOptionPending = localStorage.getItem("prevDurationOptionPending");
    var prevPaginationOptionPending = localStorage.getItem("prevPaginationOptionPending");
    var prevDurationOptionCancelled = localStorage.getItem("prevDurationOptionCancelled");
    var prevPaginationOptionCancelled = localStorage.getItem("prevPaginationOptionCancelled");

    if(prevDurationOptionOpen == null || prevDurationOptionOpen == undefined) {
        localStorage.setItem("prevDurationOptionOpen", openDurationOption);
        localStorage.setItem("prevPaginationOptionOpen", openPaginationOption);
    } else {
        localStorage.setItem("prevDurationOptionOpen", openDurationOption);
        localStorage.setItem("prevPaginationOptionOpen", openPaginationOption);
        if(openDurationOption != prevDurationOptionOpen || openPaginationOption != prevPaginationOptionOpen) {
            setTimeout(function () {
                $('#tab_1').click();
            }, 500);
        }
    }

    if(prevDurationOptionPending == null || prevDurationOptionPending == undefined) {
        localStorage.setItem("prevDurationOptionPending", pendingDurationOption);
        localStorage.setItem("prevPaginationOptionPending", pendingPaginationOption);
    } else {
        localStorage.setItem("prevDurationOptionPending", pendingDurationOption);
        localStorage.setItem("prevPaginationOptionPending", pendingPaginationOption);
        if(pendingDurationOption != prevDurationOptionPending || pendingPaginationOption != prevPaginationOptionPending) {
            setTimeout(function () {
                $('#tab_2').click();
            }, 500);
        }
    }

    if(prevDurationOptionCancelled == null || prevDurationOptionCancelled == undefined) {
        localStorage.setItem("prevDurationOptionCancelled", cancelledDurationOption);
        localStorage.setItem("prevPaginationOptionCancelled", cancelledPaginationOption);
    } else {
        localStorage.setItem("prevDurationOptionCancelled", cancelledDurationOption);
        localStorage.setItem("prevPaginationOptionCancelled", cancelledPaginationOption);
        if(cancelledDurationOption != prevDurationOptionCancelled || cancelledPaginationOption != prevPaginationOptionCancelled) {
            setTimeout(function () {
                $('#tab_3').click();
            }, 500);
        }
    }

    // if(pendingDurationOption != 1) {
    //     setTimeout(function () {
    //         $('#tab_2').click();
    //     }, 500);
    // }
    //
    // if(cancelledDurationOption != 1) {
    //     setTimeout(function () {
    //         $('#tab_3').click();
    //     }, 500);
    // }

    $('#filter_options_open').change(function () {
        $('#open_duration_form').submit();
    });

    $('#filter_options_pending').change(function () {
        $('#pending_duration_form').submit();
    });
});