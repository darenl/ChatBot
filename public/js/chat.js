// WebSocket connection setup
var socket = io();
var questionReceived=false;
var messages = $('#messages');

function sendMessage() {
    var input = $("#input").val();
    socket.emit('message', input);
    if(input)
      messages.append("<p class='answer'>" + input + "</p><br><br>");

    $("#input").val("");
    $("#input").hide();
    $("#btn").hide();
}

//push enter key (using jquery), to run bot function.
$(document).keypress(function(e) {
  if (e.which == 13 && questionReceived === true) {
    questionReceived = false;
    sendMessage();// run bot function when enter key pressed
  }
});

$(document).ready(function(){
  $("#btn").click(function(){
    if(questionReceived === true){
      questionReceived = false;
      sendMessage();
    }
  });
});

function changeText(input){
  messages.append("<p class='bot_response'>" + input + "</p><br><br><br>");
}

socket.on('warning', function(msg) {
  changeText(msg);
});

socket.on('question', function(msg) {
  questionReceived=true;
  $("#input").show();
  $("#btn").show();
  changeText(msg);
});

socket.on('done', function(msg){
  $("#input").hide();
  $("#btn").hide();
  changeText(msg);
});

socket.on('connect',function(){// We let the server know that we are up and running also from the client side;
  socket.emit('loaded');
  messages.empty();
});