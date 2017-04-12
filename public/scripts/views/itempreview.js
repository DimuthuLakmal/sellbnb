/**
 * Created by Dimuthu on 4/12/2017.
 */

$(document).ready(function () {

    //retrieve item from local Storage to show details
    var item = JSON.parse(localStorage.getItem("previewItem"));

    var days = item.days;
    var hours = item.hours;
    var mins = item.mins;

    var formattedTime = "";
    if(days =="") {
        formattedTime = "0 Days ";
    } else {
        formattedTime = days+" Days ";
    }

    if(hours == "") {
        formattedTime += "0 Hours ";
    } else {
        formattedTime += hours+" Hours ";
    }

    if(mins == "") {
        formattedTime += "0 Mins ";
    } else {
        formattedTime += mins+" Mins ";
    }

    $('#mainTitle').text(item.title);
    $('#title').text(item.title);
    $('#quantity').text(item.quantity);
    $('#packingType').text(item.packingType);
    $('#deliveryBy').text(item.deliveryBy);
    $('#warehouse').text(item.warehouse);
    $('#paymentTerm').text(item.paymentTerms);
    $('#note').text("Seller Note : "+item.sellerNote);
    $('#suggestedPrice').text(item.suggestedPrice);
    $('#timeLeft').text("Time left : " + formattedTime);
});