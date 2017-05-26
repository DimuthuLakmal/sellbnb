$('#submit-news-button').click(function (e) {
    //e.preventDefault();
});

var images = [];
var $uploadCrop;

$(document).ready(function () {

    $uploadCrop = $('#upload-demo').croppie({
        viewport: {
            width: 400,
            height: 400,
        },
    });
});

//handle image upload button click
$("#fileToUpload").change(function(event){
    if (this.files && this.files[0]) {
        var reader = new FileReader();

        //set image to preview
        reader.onload = function (e) {
            $uploadCrop.croppie('bind', {
                url: e.target.result,
                zoom: 5,
            }).then(function(){
                console.log('jQuery bind complete');
            });
        }

        $('#cropWindow').click();

        reader.readAsDataURL(this.files[0]);

        //pushing images to image array to sent to the server
        $.each(event.target.files, function(index, file) {
            reader = new FileReader();
            reader.onload = function(event) {
                object = {};
                object.filename = file.name;
                object.data = event.target.result;
                images.push(object);
            };
            reader.readAsDataURL(file);
        });
    }
});

$('#crop-btn').click(function () {
    $uploadCrop.croppie('result', {
        type: 'base64',
        size: 'viewport'
    }).then(function (resp) {
        $('#imagepreview-div').append('<div class="two columns">'+
            '<img src="'+resp+'"'+
            'style="width: 120px; height: 120px" id="blah"/>'+
            '<a href="#">(Remove)</a>'+
            '</div>');
        images[images.length-1].data = resp;
        $('.mfp-close').click();
    });
});

$('#commodity-uploadimage').click(function (e) {
    e.preventDefault();
    $('#fileToUpload').click();
});

//sending data to server using ajax
$('#submit-news-button').click(function (e) {
    e.preventDefault();

    // var quantity = $('#quantity').val()+' '+$('#measureUnit').val();
    var title = $('#title').val();
    var old_title = $('#old_title').val();
    var news_content = tinyMCE.get('news_content').getContent();
    var category = $('#category').val();
    var userId = $('#userId').val();
    var language = $('#language').val();
    var keywords = $('#keywords').val();
    var summary = $('#news_summary').val();

    $.ajax({url: "/api/news/addnews",
        type: 'POST',
        data: {title:title, old_title: old_title, language: language, news_content: news_content, summary: summary,userId: userId, images: images, category: category, keywords: keywords},
        success: function(data, status, xhr) {
            if(status == 'success') {
                $('#message_success').show();
            }
        }
    });
});


//upload news images----------------------------------------
/**
 * Created by kjtdi on 1/28/2017.
 */
var NewsImages = [];

//handle image upload button click
$("#newsImagesToUpload").change(function(event){
    if (this.files && this.files[0]) {
        var reader = new FileReader();

        //set image to preview
        reader.onload = function (e) {
            $('#newsImagePreview-div').append('<div class="two columns">'+
                '<img src="'+e.target.result+'"'+
                'style="width: 120px; height: 120px" id="blah"/>'+
                '<a href="#">(Remove)</a>'+
                '</div>');
        }

        reader.readAsDataURL(this.files[0]);

        //pushing images to image array to sent to the server
        $.each(event.target.files, function(index, file) {
            reader = new FileReader();
            reader.onload = function(event) {
                object = {};
                object.filename = file.name;
                object.data = event.target.result;
                NewsImages.push(object);
            };
            reader.readAsDataURL(file);
        });
    }
});

$('#news-uploadimage').click(function (e) {
    e.preventDefault();
    $('#newsImagesToUpload').click();
});

//sending data to server using ajax
$('#submit-image-button').click(function (e) {
    e.preventDefault();

    $.ajax({url: "/api/news/addimages",
        type: 'POST',
        data: {images: NewsImages},
        success: function(data, status, xhr) {
            if(status == 'success') {
                $('#image_message_success').show();
            }
        }
    });
});