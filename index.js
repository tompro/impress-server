var express = require("express"),
	http = require("http"),
	socket = require("socket.io"),
  path = require("path"),
  Server;


module.exports = Server = function(dir, port) {
  this.port = port || 8080;
  this.dir = dir || ".";
}

Server.prototype.start = function(dir, port) {
  this.port = port || this.port;
  this.dir = dir || this.dir;
  
  this.app = express();
  this.app.use("/js", express.static(__dirname + "/public/js"));
  this.app.use(express.static(path.resolve(this.dir)));

  this.server = http.createServer(this.app);
  this.io = socket.listen(this.server, {
    "log level": 0
  });
  this.setupSocket();
  this.server.listen(this.port);
  console.log(
    "Presentation server serves directory: " + 
    path.resolve(this.dir) + " on port: " + this.port
  );
}

Server.prototype.setupSocket = function() {
  var io = this.io, presenter, currentSlide;
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
}