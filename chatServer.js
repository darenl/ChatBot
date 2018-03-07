/*
chatServer.js
Author: David Goedicke (da.goedicke@gmail.com)
Closley based on work from Nikolas Martelaro (nmartelaro@gmail.com) as well as Captain Anonymous (https://codepen.io/anon/pen/PEVYXz) who forked of an original work by Ian Tairea (https://codepen.io/mrtairea/pen/yJapwv)
*/

var express = require('express'); // web server application
var app = express(); // webapp
var http = require('http').Server(app); // connects http library to server
var io = require('socket.io')(http); // connect websocket library to server
var serverPort = 8000;


//---------------------- WEBAPP SERVER SETUP ---------------------------------//
// use express to create the simple webapp
app.use(express.static('public')); // find pages in public directory

// start the server and say what port it is on
http.listen(serverPort, function() {
  console.log('listening on *:%s', serverPort);
});
//----------------------------------------------------------------------------//


//---------------------- WEBSOCKET COMMUNICATION -----------------------------//
// this is the websocket event handler and say if someone connects
// as long as someone is connected, listen for messages
io.on('connect', function(socket) {
  console.log('a new user connected');
  var questionNum = 0; // keep count of question, used for IF condition.
  socket.on('loaded', function(){// we wait until the client has loaded and contacted us that it is ready to go.

  socket.emit('answer',"Hey, Hello I am John! I am going to ask you a couple of questions."); //We start with the introduction;
  setTimeout(timedQuestion, 2500, socket,"What is the name of the person/patient?"); // Wait a moment and respond with a question.

});
  socket.on('message', (data)=>{ // If we get a new message from the client we process it;
        questionNum= bot(data,socket,questionNum);	// run the bot function with the new message
      });
  socket.on('disconnect', function() { // This function  gets called when the browser window gets closed
    console.log('user disconnected');
  });
});
//--------------------------CHAT BOT FUNCTION-------------------------------//
var name;
function bot(data,socket,questionNum) {
  var input = data; // This is generally really terrible from a security point of view ToDo avoid code injection
  var answer;
  var question;
  var waitTime;
  var finished = false;

/// These are the main statments that make up the conversation.
  if (questionNum == 0) {
    name = input;
    question = 'Does ' + name + ' repeat himself or herself or ask the same question over and over again (No, Sometimes, Often)?';			    	// load next question
  }
  else if (questionNum == 1) {
    if(input.toLowerCase() === "no"){
      question = "No need to worry";
      finished = true;
    }
    else if(input.toLowerCase() === "sometimes" || input.toLowerCase() === "often"){
      question = "Does " + name + " seem more forgetful, that is, have trouble with short-term memory (No, Sometimes, Often)?";
    }
    else{
      answer = "I did not understand that answer. Please type either No, Sometimes, or Often.";
      question = 'Does ' + name + ' repeat himself or herself or ask the same question over and over again (No, Sometimes, Often)?';            // load next question
      waitTime = 2000;
      questionNum--;
    }
  }
  else if (questionNum == 2) {
    if(input.toLowerCase() === "no"){
      question = "No need to worry";
      finished = true;
    }
    else if(input.toLowerCase() === "sometimes"){
      question = "Does it impact daily tasks (Yes/No)?";
      questionNum -= .5;
    }
    else if(input.toLowerCase() === "often"){
      question = "Does " + name + " need multiple reminders to do things they used to do on their own, like chores, shopping or taking medication (Yes/No)?";
    }
    else{
      answer = "I did not understand that answer. Please type either No, Sometimes, or Often.";
      question = "Does " + name + " seem more forgetful, that is, have trouble with short-term memory (No, Sometimes, Often)?";
      waitTime = 2000;
      questionNum--;
    }
  }
  else if (questionNum == 2.5) {
    if(input.toLowerCase() === "no"){
      question = "No need to worry";
      finished = true;
    }
    else if(input.toLowerCase() === "yes"){
      question = "Does " + name + " need multiple reminders to do things they used to do on their own, like chores, shopping or taking medication (Yes/No)?";
      questionNum -= .5;
    }
    else{
      answer = "I did not understand that answer. Please type either Yes or No.";
      question = "Does it impact daily tasks (Yes/No)?";
      waitTime = 2000;
      questionNum--;
    } 
  }
  else if (questionNum == 3) {
    if(input.toLowerCase() === "no"){
      question = "No need to worry";
      finished = true;
    }
    else if(input.toLowerCase() === "yes"){
      question = "Does " + name + " repeatedly forget important appointments, family occasions or holidays? (Yes/No)";
    }
    else{
      answer = "I did not understand that answer. Please type either Yes or No.";
      question = "Does " + name + " need multiple reminders to do things they used to do on their own, like chores, shopping or taking medication (Yes/No)?"
      waitTime = 2000;
      questionNum--;
    } 
  }
  else if (questionNum == 4) {
    if(input.toLowerCase() === "no"){
      question = "No need to worry";
      finished = true;
    }
    else if(input.toLowerCase() === "yes"){
      question = "Schedule an office visit to continue this test!";
    }
    else{
      answer = "I did not understand that answer. Please type either Yes or No.";
      question = "Does " + name + " repeatedly forget important appointments, family occasions or holidays? (Yes/No)";
      waitTime = 2000;
      questionNum--;
    } 
  }
  else{
    question = "The test is complete!";
  }

  if(finished){
    questionNum = 5;
  }

  if(answer){
    socket.emit('answer', answer);
    console.log(question);
    answer = "";
    setTimeout(timedQuestion, waitTime, socket, question);
  }
  else{
    socket.emit('question', question);
  }
  //setTimeout(timedQuestion, waitTime,socket,question);
  return (questionNum+1);
}

function timedQuestion(socket,question) {
  if(question!=''){
  socket.emit('question',question);
}
  else{
    //console.log('No Question send!');
  }

}
//----------------------------------------------------------------------------//
