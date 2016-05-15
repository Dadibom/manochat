var express = require('express');
var shout = require('shout');
var url = require('url');
var app = express();
var server = require('http').createServer();
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port:8080 })
var Filter = require('bad-words'),
  filter = new Filter();

app.use(express.static('public'));

//app.get("/test",function(req,res){
//  res.send('hello world');
//});

wss.on('connection', function connection(ws) {
  ws.send(JSON.stringify({
    action: 'suggest-username',
    username: haiku()
  }));
  var location = url.parse(ws.upgradeReq.url, true);
  // you might use location.query.access_token to authenticate or share sessions
  // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
  var path = location.path;
  
  ws.on('message', function incoming(message) {
    var req = JSON.parse(message);//TODO error handling?
    if(ws.username){
      switch(req.action){
        case 'sub': 
          if(req.channel.length > 0 && req.channel.length <= 32){
            shout.sub(ws,req.channel);
          }
          break;
        case 'unsub':
          shout.unsub(ws,req.channel);
          break;
        case 'shout':
          if(req.message.length > 0 && req.message.length < 256){
            shout.broadcast(req.channel,ws.username + ": " + filter.clean(req.message));
          }
          break;
      }
    }else{//user has not selected a username
      if(req.action == "auth"){
        if(req.username.split("*").length != filter.clean(req.username).split("*").length)
          return;

        if(req.username.length <3 || req.username.length >25){
          return;
        }
        ws.username = req.username;
        ws.send(JSON.stringify({
          action: 'auth',
          accepted:true
        }));
      }

    }
  });
  ws.on('close', function close() {
    shout.unsub(ws);
  });
});
//TODO handle socket close

var server = app.listen(8081, function () {
	var host = server.address().address
	var port = server.address().port

	console.log("Example app listening at http://%s:%s", host, port)
})

function haiku(){
  var adjs = ["autumn", "hidden", "bitter", "misty", "silent", "empty", "dry",
  "dark", "summer", "icy", "delicate", "quiet", "white", "cool", "spring",
  "winter", "patient", "twilight", "dawn", "crimson", "wispy", "weathered",
  "blue", "billowing", "broken", "cold", "damp", "falling", "frosty", "green",
  "long", "late", "lingering", "bold", "little", "morning", "muddy", "old",
  "red", "rough", "still", "small", "sparkling", "throbbing", "shy",
  "wandering", "withered", "wild", "black", "young", "holy", "solitary",
  "fragrant", "aged", "snowy", "proud", "floral", "restless", "divine",
  "polished", "ancient", "purple", "lively", "nameless"]

  , nouns = ["waterfall", "river", "breeze", "moon", "rain", "wind", "sea",
  "morning", "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn",
  "glitter", "forest", "hill", "cloud", "meadow", "sun", "glade", "bird",
  "brook", "butterfly", "bush", "dew", "dust", "field", "fire", "flower",
  "firefly", "feather", "grass", "haze", "mountain", "night", "pond",
  "darkness", "snowflake", "silence", "sound", "sky", "shape", "surf",
  "thunder", "violet", "water", "wildflower", "wave", "water", "resonance",
  "sun", "wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper",
  "frog", "smoke", "star"];

  return adjs[Math.floor(Math.random()*(adjs.length-1))]+"_"+nouns[Math.floor(Math.random()*(nouns.length-1))];
}