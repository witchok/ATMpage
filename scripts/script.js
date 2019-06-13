// var apiUrl = 'https://localhost:44372/api/'; 
var apiUrl = 'https://localhost:5001/api/'; 
var cardNumber;
var pin;

$("form").on("submit", function(event) {
    event.preventDefault();
    $( "ul#listTransactions" ).empty();
        
    $('div#cardInfo').hide();
    $( "div#transactionsDiv" ).hide();

    cardNumber = $("#cardNumberInput").val();
    pin = $("#inputPIN").val();

    if(!checkCardNumber(cardNumber)){
        return false;
    }

    if(!checkPIN(pin)){
        return false;
    }

    $('span#cardNumberError').text("");
    $('span#pinError').text("");

    $.ajaxSetup({
    headers:{
        'Authorize': pin,
        'Accept': 'application/json'
        }
    });

    $.get(apiUrl + 'cards/'+cardNumber)
        .done( function(data, textStatus, request) {
            
            console.log(textStatus);
            var firstName = data.owner.firstName;
            var lastName = data.owner.lastName;
            $('div#cardInfo').show();
            $('span#cardNumber').text(cardNumber);
            $('span#balanceSpan').text(data.balance);
            $('span#ownerSpan').text(firstName + ' ' + lastName);
        })
        .fail(function(data, textStatus, errorThrown){
            console.log("An error occured: " + errorThrown);
            if(data.status == 404){
                console.log("cardNumber not found");
                $('span#cardNumberError').text("Card doesn't exist !!!");
            }
            if(data.status == 403){
                console.log("pin not good");
                $('span#pinError').text("wrong PIN !!!");
            }
        });  
});
    



$('button#showTransactions').click(function() {
    console.log("tara");
    $( "ul#listTransactions" ).empty();
        $.ajaxSetup({
        headers:{
        'Authorize': pin,
        'Accept': 'application/json'
    }
    });


    $.ajax({
        url: apiUrl + 'cards/'+cardNumber+"/transactions",
        type: 'GET',
        success: function(data, textStatus, request) {
            appendTransactions(data);            
            console.log(textStatus);
        },
        error: function(data, textStatus, errorThrown){
            console.log("An error occured: " + errorThrown);
        }  
    });
});



$('#cardNumberInput').keyup(function(){
    if (!checkCardNumber($('#cardNumberInput').val())) {
        console.log('wrong');
        $('span#cardNumberError').text('Card number should be valid');
    }else{
        $('span#cardNumberError').text('');   
    }
});

$('#inputPIN').keyup(function(){
    if (!checkPIN($('#inputPIN').val())) {
        console.log('wrong');
        $('span#pinError').text('PIN should be valid');
    }else{
        $('span#pinError').text('');   
    }
});

function checkCardNumber(number){
    if(number.match(/^\d{16}$/)){
        return true;
    }
    return false;
}

function checkPIN(pin){
    if(pin.match(/^\d{4}$/)){
        return true;
    }
    return false;
}


function appendTransactions(transactions){
    $( "div#transactionsDiv" ).show();
    if(transactions.length == 0){
        $( "ul#listTransactions" ).append( "<h4>You haven't done any transactions yet</h4>" );
        return;
    }
    for (let i = 0; i < transactions.length; i++) {
        $( "ul#listTransactions" ).append( "<li class=\"list-group-item\">"+
        "Date : "+transactions[i].executionDate + "<br/>"+
        "Amount: "+transactions[i].amount + "<br/>"+
        (transactions[i].senderCardNumber === cardNumber ?  
            "Sent to: " + transactions[i].recipientCardNumber : 
            "Recieved from: " + transactions[i].senderCardNumber)+"<br/>"+
         (transactions[i].isSuccesful ?  
            "<span class='succesful'>Succesful</span>" : 
            "<span class='not-succesful' >Not Succesful</span>") + "</li>");
    }
}