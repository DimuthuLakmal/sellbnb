/**
 * Created by kjtdi on 5/2/2017.
 */
$('tr[data-href]').on("click", function() {
    document.location = $(this).data('href');
});