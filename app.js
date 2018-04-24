var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(3000, function(){
    console.log("Connected with port 3000");
});

var clients = {};

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  socket.on('add-user', function(data){ 
    if (clients[data.username]){
      socket.emit('userExistonRegistration', "<h1>User exist: <strong>" + data.username + "</strong></h1>");
    } else {  
        socket.emit('showchat', data.username);
        clients[data.username] = {
            "socket": socket.id
        };
    } 
  });

  socket.on('private-message', function(data){
    console.log("Sending: " + data.content + " to " + data.username + " from " + data.from);
    if (clients[data.username]){
      io.sockets.connected[clients[data.username].socket].emit("add-message", data);
    } else {
      socket.emit('userExist', "<h1>User does not exist: <strong>" + data.username + "</strong></h1>");
    }
  });


    socket.on('boardcast-message', function (data) {
        //console.log(socket);
        // we tell the client to execute 'new message'
        //io.sockets.broadcast.emit('boardcast-message', "test message");
        io.emit('boardcast-message', data);
    });

  //Removing the socket on disconnect
  socket.on('disconnect', function() {
  	for(var name in clients) {
  		if(clients[name].socket === socket.id) {
  			delete clients[name];
  			break;
  		}
  	}	
  })

});



