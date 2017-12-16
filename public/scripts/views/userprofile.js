/**
 * Created by kjtdi on 3/30/2017.
 */
var imgDataArr = [];

function rate(value, column){
    $('#rating_'+column).val(value);
}

function readFile(file) {
  var FR = new FileReader();

  FR.addEventListener("load", function (e) {
    imgDataArr.push({
      filename: file.name,
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

