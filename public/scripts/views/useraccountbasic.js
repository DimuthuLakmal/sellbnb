/**
 * Created by kjtdi on 1/24/2017.
 */
$('#submitpassword').click(function (e) {
    e.preventDefault();
    if($('#newpassword').val() != $('#newrepassword').val()) {
        $('#passwordErrorMessage').show();
    } else {
        $('#passwordErrorMessage').hide();
        $('#passwordChangeForm').submit();
    }
})