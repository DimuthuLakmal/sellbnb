/**
 * Created by kjtdi on 2/9/2017.
 */
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
    }
});

$('#filter_options').change(function() {
    $('#filter_form').submit();
});