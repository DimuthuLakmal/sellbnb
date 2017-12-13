/**
 * Created by kjtdi on 3/26/2017.
 */
var images = [];

//handle image upload button click
$("#fileToUpload").change(function(event){
    if (this.files && this.files[0]) {
        var reader = new FileReader();
        var userId = $('#userId').val();

        //set image to preview
        reader.onload = function (e) {
            var imagelink = e.target.result;
            $('#company-logo').attr("src",imagelink);
        };

        reader.readAsDataURL(this.files[0]);

        //pushing images to image array to sent to the server
        $.each(event.target.files, function(index, file) {
            reader = new FileReader();
            reader.onload = function(event) {
                object = {};
                object.filename = file.name;
                object.data = event.target.result;
                images.push(object);

                $.ajax({url: "/api/user/logo",
                    type: 'POST',
                    data: {userId: userId, images: images},
                    success: function(data, status, xhr) {
                        if(status == 'success') {

                        }
                    }
                });
            };
            reader.readAsDataURL(file);
        });
    }
});

$('#logo-upload').click(function () {
    $('#fileToUpload').click();
});

//get search results for auto suggestion in trading commodity add
$('#newbuyingcommodity').keyup(function () {
    var keyword = $(this).val();
    jQuery.ajax({
        type: "POST",
        dataType: 'jsonp',
        url: "/api/commodity/keyword",
        data: {keyword: keyword},
        success: function (obj, textstatus) {
            $('#searchresults').empty();
            //populating results to auto suggest drop down
            var commodities = obj;
            $.each(commodities, function (index, commodity) {
                $('#searchresults').append('<option value=\"'+commodity.name+'\">');
            });
        }
    });
});

//get search results for auto suggestion in trading commodity add
$('#newsellingcommodity').keyup(function () {
    var keyword = $(this).val();
    jQuery.ajax({
        type: "POST",
        dataType: 'jsonp',
        url: "/api/commodity/keyword",
        data: {keyword: keyword},
        success: function (obj, textstatus) {
            $('#searchresultsselling').empty();
            //populating results to auto suggest drop down
            var commodities = obj;
            $.each(commodities, function (index, commodity) {
                $('#searchresultsselling').append('<option value=\"'+commodity.name+'\">');
            });
        }
    });
});

$('.tradingbuyingremove').click(function () {
    $(this).next().next().submit();
});

$('.tradingsellingremove').click(function () {
    $(this).next().next().submit();
});

$('.certificateremove').click(function () {
    $(this).next().next().submit();
});

$('#CompyIntroForm').submit(function() {
  var htmlValues = tinyMCE.get('editor').getContent();
  $('#introRawTxt').val(htmlValues);

});



//handle image upload button click
$("#imageFile").change(function(event){
  if (this.files && this.files[0]) {
    var reader = new FileReader();
    var userId = $('#userId').val();

    reader.readAsDataURL(this.files[0]);

    //pushing images to image array to sent to the server
    $.each(event.target.files, function(index, file) {
      reader = new FileReader();
      reader.onload = function(event) {
        object = {};
        object.filename = file.name;
        object.data = event.target.result;
        images.push(object);

        $.ajax({url: "/api/user/businessImages",
          type: 'POST',
          data: {userId: userId, images: images},
          success: function(data, status, xhr) {
            if(status == 'success') {
              console.log(data);
            }
          }
        });
      };
      reader.readAsDataURL(file);
    });
  }
});

$('#images-upload').click(function () {
  $('#imageFile').click();
});
