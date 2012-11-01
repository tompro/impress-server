var express = require("express"),
	http = require("http"),
	socket = require("socket.io"),
  path = require("path"),
  fs = require("fs"),
  async = require("async"),
  clientDeps = [
    "/js/loader.js",
    "/js/impress.js"
  ],
  Server;


module.exports = Server = function(dir, port, pass) {
  this.port = port || 8080;
  this.dir = dir || ".";
  this.pass = pass;
}

Server.prototype.start = function(dir, port) {
  this.port = port || this.port;
  this.dir = dir || this.dir;
  
  this.setupApp();

  this.server = http.createServer(this.app);
  this.io = socket.listen(this.server, {
    "log level": 0
  });
  this.setupSocket();
  this.server.listen(this.port);
  console.log(
    "Impress-server serves directory: " + 
    path.resolve(this.dir) + " on port: " + this.port
  );
  console.log("To claim presenter mode use the following password: " + this.getPass());
}

Server.prototype.setupApp = function() {
  this.app = express();
  this.setupImpressRoute();
  this.setupStaticDirs();
}

Server.prototype.setupImpressRoute = function() {
  this.app.get(/impress.js/, function(request, response) {
    response.set('Content-Type', 'text/javascript');
    /*if(this.impress) {
      response.send(this.impress);
      return;
    }*/

    var files = [];
    for(var i=0; i<clientDeps.length; i++) {
      files[i] = __dirname + clientDeps[i];
    }

    async.map(files, fs.readFile, function(err, res) {
      this.impress = res.join('');
      response.send(this.impress);
    });
    
  });
};

Server.prototype.setupStaticDirs = function() {
  this.app.use("/js", express.static(__dirname + "/js"));
  this.app.use(express.static(path.resolve(this.dir)));
  this.app.use(express.static(__dirname + "/public"));
};

Server.prototype.getPass = function() {
  if(!this.pass) {
    var crypto = require('crypto');
    this.pass = crypto.createHash('md5')
                .update(String(new Date().valueOf()))
                .digest("hex").substring(0,4);
  }
  return this.pass;
}

Server.prototype.setupSocket = function() {
  var io = this.io, presenter, currentSlide, totalSlides, self = this;
  io.sockets.on('connection', function (socket) {
    
    socket.on("register:viewer", function(data) {

        if( ! presenter ) {
          socket.emit("mode:presenter", {broadcast: false});
          totalSlides = data.totalSlides;
        } else {
          socket.emit('mode:view', {slide:currentSlide});
          if(presenter == socket) {
            totalSlides = data.totalSlides;
          }
        }

        socket.on('follow:presenter', function() {
          socket.emit("mode:view", {slide: currentSlide});
        });
    });

    socket.on("register:remote", function(data) {
        var data = {
          slide: (currentSlide || 0),
          totalSlides: (totalSlides || 0)
        };
        socket.emit("init:remote", data); 
    });

    socket.on('release:presenter', function() {
      if(socket == presenter) {
        presenter = null;
        io.sockets.emit("mode:presenter", {broadcast: false});
      }
    });

    socket.on('claim:presenter', function(data) {
      console.log("claim with ", data);

      if( self.getPass() == data.pass ) {
        if(presenter == socket) return;
        
        currentSlide = data.slide;
        if(presenter) {
          presenter.emit('mode:view', {slide: currentSlide});
        } else {
          socket.broadcast.emit('mode:view', {slide: currentSlide});
        }

        presenter = socket;
        socket.emit("mode:presenter", {broadcast: true});
      }
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