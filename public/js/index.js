// WebSocket connection setup
var socket = io();
var questionRecieved=false;
													// keep count of question, used for IF condition.
//var output = document.getElementById('output');				// store id="output" in output variable
//output.innerHTML = "<p id=response> </p>";													// ouput first question
var messages = document.getElementById('messages');

function sendMessage() {
    var input = document.getElementById("input").value;
    socket.emit('message',input);
    if(input)
      messages.innerHTML += "<p class='answer'>" + input + "</p><br><br>";

    document.getElementById("input").value="";
    document.getElementById("input").style.display="none";
}

//push enter key (using jquery), to run bot function.
$(document).keypress(function(e) {
  if (e.which == 13 && questionRecieved===true) {
    questionRecieved=false;
    sendMessage();// run bot function when enter key pressed
  }
});

function changeText(input){
//document.getElementById('response').textContent = input;
messages.innerHTML += "<p class='bot_response'>" + input + "</p><br><br><br>";
}

socket.on('answer', function(msg) {
  changeText(msg);
});

socket.on('question', function(msg) {
  questionRecieved=true;
  document.getElementById("input").style.display="block";
  changeText(msg);
});

socket.on('connect',function(){// We let the server know that we are up and running also from the client side;
  socket.emit('loaded');
});
