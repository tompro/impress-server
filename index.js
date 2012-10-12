var express = require("express"),
	app = express(),
	server = require("http").createServer(app),
	io = require("socket.io").listen(server);

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res){
  res.send('Presentation index');
});

server.listen(8080);

var presenter;
var currentSlide;

io.sockets.on('connection', function (socket) {

  if( ! presenter ) {
    socket.emit("mode:presenter", {broadcast: false});
  } else {
    socket.emit('mode:view', {slide:currentSlide});
  }

  socket.on('claim:presenter', function(data) {
    if( ! presenter ) {
      presenter = socket;
      currentSlide = data.slide;
      socket.broadcast.emit('mode:view', {slide: currentSlide});
      socket.emit("mode:presenter", {broadcast: true});
    }
  });

  socket.on('release:presenter', function() {
    if(socket == presenter) {
      presenter = null;
      io.sockets.emit("mode:presenter", {broadcast: false});
    }
  });

  socket.on('follow:presenter', function() {
    socket.emit("mode:view", {slide: currentSlide});
  });

  socket.on('goto', function (data) {
    if(presenter == socket) {
      currentSlide = data.slide;
      socket.broadcast.emit('goto', data);
    }
  });

  socket.on('disconnect', function() {
    if(presenter == socket) {
      presenter = null;
      currentSlide = null;
      socket.broadcast.emit("mode:presenter", {broadcast: false});
    }
  });
});