/*
chatServer.js
Author: Daren Liu
Original skeleton code author: David Goedicke (da.goedicke@gmail.com)
Closely based on work from Nikolas Martelaro (nmartelaro@gmail.com) as well as Captain Anonymous (https://codepen.io/anon/pen/PEVYXz) who forked of an original work by Ian Tairea (https://codepen.io/mrtairea/pen/yJapwv)
*/

const express = require('express'); // web server application
const app = express(); // webapp
const bodyParser = require('body-parser');
const http = require('http').Server(app); // connects http library to server
const io = require('socket.io')(http); // connect websocket library to server
const fs = require('fs');
const ChatBot = require('./chatbot');
const serverPort = 8000;
let nodes;

//---------------------- WEBAPP SERVER SETUP ---------------------------------//
// use express to create the simple webapp
app.use(express.static('public')); // find pages in public directory
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/tree', function(req, res){
  //console.log(req.body);
  fs.writeFile('questions.json', JSON.stringify(req.body), 'utf-8', function(){
    return res.json({msg: "complete"});
  });
});

app.get('/chat', function(req, res){
  res.sendFile(__dirname + "/public/chat.html");
});

// start the server and say what port it is on
http.listen(serverPort, function() {
  console.log('listening on *:%s', serverPort);
});
//----------------------------------------------------------------------------//


//---------------------- WEBSOCKET COMMUNICATION -----------------------------//
// this is the websocket event handler and outputs a msg after connection
// as long as someone is connected, listen for messages
io.on('connect', function(socket) {
  const chat = new ChatBot(socket);
  x = 0; // keep count of question, used for IF condition.

  //Wait until the client has loaded before emitting any messages
  socket.on('loaded', function(){

    //Introduction from chat bot
    socket.emit('question',"Hey, Hello I am Chat Bot! I am going to ask you a couple of questions.");

    //After 2500 milliseconds, ask first question
    chat.emit_timed_question();
  });

  //Listens for any new messages from the client and processes it
  socket.on('message', function(data){

    //Runs the bot function with the new message
    bot(chat, data,socket);

  });

  //Logs to the user during disconnect
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });

});

//--------------------------CHAT BOT FUNCTION-------------------------------//
//"Bot" functionality: handles all the questions and answers
function bot(chat, data,socket) {
  let input = data.toLowerCase();

  if(chat.check_response(input)){
    chat.next_question(input);
    if(chat.tree_finished()){
      chat.emit_done();
    }
    else{
      chat.emit_question();
    }
  }
  else{
    chat.emit_warning();
  }
}
//----------------------------------------------------------------------------//
