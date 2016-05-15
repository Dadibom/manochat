var ws;
document.addEventListener("DOMContentLoaded", function(event) { 
	var con = document.getElementById("messages");
	var inp = document.getElementById("message-field");

	ws = new WebSocket("ws://"+window.location.hostname+":8080");
	ws.onopen = function (event) {
	  	ws.send(JSON.stringify({
	  		action:"sub",
	  		channel:"global"
	  	})); 
	  	ws.onmessage = function (event) {
	  		var obj = JSON.parse(event.data);
		  	con.innerHTML = con.innerHTML+"<span class='channel'>#"+obj.channel+"</span> "+obj.message+"<br>";
		};
	};
	document.getElementById("input").onsubmit = function(){
		var m = JSON.stringify({
	  		action:"shout",
	  		channel:"global",
	  		message:inp.value
	  	});
		ws.send(m); 
	  	//console.log(m);
		inp.value = "";
		return false;
	};
});