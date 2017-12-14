/**
 * Created by kjtdi on 2/8/2017.
 */
//set rating to hidden input rating

imgDataArr = [];
$('#bidformToSubmit').submit(function (e) {
  e.preventDefault();

  var data = {};
  $('#bidformToSubmit').serializeArray().forEach(function (d) {
    data[d['name']] = d['value'];
  });

  $.ajax({
    url: "/api/offer/add",
    type: 'POST',
    data: data,
    success: function (data, status, xhr) {
      if (status == 'success') {
        $('#message_success').show();
      }
    }
  });

});

function readFile(file) {
  var FR = new FileReader();

  FR.addEventListener("load", function (e) {
    imgDataArr.push({
      // filename: file.name,
      path: e.target.result
      // encoding: 'base64'
    });
  });

  FR.readAsDataURL(file);
}

$('#inputAtt').change(function () {
  $(this.files).each(function (i, f) {
    readFile(f);
  })
});

$('#add-comment').submit(function () {
  $('#imgData').val(JSON.stringify(imgDataArr));
});
