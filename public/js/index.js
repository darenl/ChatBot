class Node{
	
	constructor(div, isRoot, parent){
		this.children = [];
		this.div = div;
		this.parent = parent || null;
		this.div.draggable({
			stop: (event, ui) => {
				Node.tree_connector.deleteConnectionsForElement(this.div);
				if(this.children.length > 0){
					for(let x = 0; x < this.children.length; x++){
						let child = this.children[x];
						Node.tree_connector.connect({
							source: this.id,
							target: child.id
						});
					}
				}
				if(this.parent){
					Node.tree_connector.connect({
						source: this.parent.id,
						target: this.id
					});
				}
			}
		});
		this.isRoot = isRoot || false;
		this.button = this.div.find("button.create");
		this.delete = this.div.find("button.delete");
		this.warning = "Answer not recognized. Please answer with a valid answer response";
		this.id = "connect" + Node.counter++;
		this.div.attr('id', this.id);
		
		//adds child to the doc
		this.button.click(() => {
			let content = this.div.find("textarea").val();
			let choice = this.div.find("input.choice").val();
			if(content && (choice || this.isRoot)){
				let newNode = $("<div class='node' tabindex='-1'><div class='nodeheader'><input type='text' name='choice' class='choice' placeholder='Enter answer choice'></div><textarea type='text' name='content' class='content'></textarea><br><button class='delete'>Delete</button><button class='create'>Create New Branch</button></div>").appendTo(this.div);
				let node = new Node(newNode, false, this);
				Node.tree_connector.connect({
					source: this.id,
					target: node.id
				});
				this.children.push(node);
				this.delete.prop("disabled", true);
			}
			else{
				window.alert("Please fill in the node before creating a new one");
			}
		});
		
		this.delete.click(() => {
			let index = this.parent.children.indexOf(this);
			this.parent.children.splice(index, 1);
			if(this.parent.children.length === 0){
				this.parent.delete.prop("disabled", false);
			}
			Node.tree_connector.deleteConnectionsForElement(this.div);
			this.div.remove();
		});
	}
}

let root_node;
jsPlumb.ready(function() {
	var tree_connector = jsPlumb.getInstance({
		PaintStyle:{ 
		  strokeWidth:6, 
		  stroke:"#567567", 
		  outlineStroke:"black", 
		  outlineWidth:1 
		},
		Connector:[ "Bezier", { curviness: 30 } ],
		Endpoint:[ "Dot", { radius:5 } ],
		EndpointStyle : { fill: "#567567"  },
		Anchor : [ 0.5, 0.5, 1, 1 ]
	});
	Node.tree_connector = tree_connector;
	Node.counter = 0;
	root_node = new Node($(".node"), true, null);
});

let node_array = [];
let export_nodes = function(node){
	let node_json = {};
	node_json.question = node.div.find("textarea").val();
	node_json.actions = {};
	node_json.warning = node.warning;
	let children = node.children;
	node_array.push(node_json);
	if(!node_json.question){
		window.alert("One or more of your nodes is empty. Please fill it in and try again");
	}
	else{
		if(children.length > 0){
			for(let x = 0; x < children.length; x++){
				let child = children[x];
				if(child){
					let choice = child.div.find("input.choice").val().toLowerCase();
					let action = child.div.find("textarea").val();
					node_json.actions[choice] = action;
					export_nodes(child);
				}
			}		
		}
	}
}
$("#export").click(() => {
	node_array = [];
	export_nodes(root_node);
	fetch('/tree', {
		method: 'post',
		body: JSON.stringify(node_array),
		headers: {
	      'Accept': 'application/json',
	      'Content-Type': 'application/json'
		}
	}).then(msg => {
		window.location.href = "/chat";
	}).catch(err => {
		//window.location.href = "/chat";
		console.log(err);
	});
});