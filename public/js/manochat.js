var ws;
document.addEventListener("DOMContentLoaded", function(event) { 
	var con = document.getElementById("messages");
	var inp = document.getElementById("message-field");

	ws = new WebSocket("ws://"+window.location.hostname+":8080");
	ws.onopen = function (event) {
	  	ws.onmessage = function (event) {
	  		console.log(event);
	  		var obj = JSON.parse(event.data);

	  		switch(obj.action){
	  			case 'broadcast':
				  	con.innerHTML = con.innerHTML+"<span class='channel'>#"+obj.channel+"</span> "+obj.message+"<br>";
				  	break;
				case 'auth':
					if(obj.accepted){
						document.getElementById("popup-blocker").classList.add("hidden");
						send({
					  		action:"sub",
					  		channel:"global"
					  	}); 
					}
					break;
				case 'suggest-username':
					document.getElementById("username-input").value = obj.username;
					break;
		}
		};
	};
	document.getElementById("input").onsubmit = function(){
		send({
	  		action:"shout",
	  		channel:"global",
	  		message:inp.value
	  	}); 
		inp.value = "";
		return false;
	};
});

function send(obj){
	//TODO if socket is not yet connected
	ws.send(JSON.stringify(obj));
}

function auth(){
	var field = document.getElementById("username-input");
	send({
		action:'auth',
		username:field.value
	});
	field.value = "";
	return false;
}