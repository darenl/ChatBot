const fs = require('fs');

class ChatBot{
	
	constructor(socket){
		this.socket = socket;
		this.done = "";
		this.questions = JSON.parse(fs.readFileSync('questions.json', 'utf-8'));
		this.curr = this.questions[0];
		this.actions = this.curr["actions"];
		this.warning = this.curr["warning"];
	}

	//Sends a question to the user
	emit_question(){
		this.socket.emit('question', this.curr.question);
	}

	next_question(r){
		let action = this.actions[r];
		for(var x = 0; x < this.questions.length; x++){
			var question = this.questions[x];
			if(question["question"] === action){
				this.curr = question;
				this.actions = question["actions"];
				this.warning = question["warning"];
			}
		}
		if(Object.keys(this.actions).length === 0){
			this.done = action;
		}
	}

	tree_finished(){
		return this.done !== "" ? true : false;
	}

	//Waits to 
	emit_timed_question(){
		setTimeout(this.timedQuestion, 1500, this.socket, this.curr.question);
	}

	check_response(r){
		return this.actions[r] !== undefined ? true : false;
	}

	emit_warning(){
		this.socket.emit('warning', this.warning);
		setTimeout(this.timedQuestion, 1500, this.socket, this.curr.question);
	}

	emit_done(){
		this.socket.emit('done', this.done);
	}

	//Emits the response
	timedQuestion(socket, q) {
    	socket.emit('question', q);
	}
}
module.exports = ChatBot;