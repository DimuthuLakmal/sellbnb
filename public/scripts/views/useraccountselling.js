/**
 * Created by kjtdi on 2/9/2017.
 */

$(document).ready(function() {
    $("#from").datepicker({ dateFormat: 'yy-mm-dd' });
    $("#to").datepicker({ dateFormat: 'yy-mm-dd' });
});

//trigger when user select an action from drop down.
$('.actions').change(function() {
    var action = $(this).val();
    $('#action-modal').click();

    $('#action-heading').text(action);

    if(action == 'Delete') {
        $('#action-description').text('Are you want to delete this listing?');
        $('#actionToSubmit').val('delete');
    } else if(action == 'Stop Bidding') {
        $('#action-description').text('Are you want to stop the bidding for this item?');
        $('#actionToSubmit').val('stopbidding');
    } else if(action == 'Cancel') {
        $('#action-description').text('Are you want to cancel the bidding for this item?');
        $('#actionToSubmit').val('cancelled');
    }
});

$('#filter_options').change(function() {
    $('#filter_form').submit();
});