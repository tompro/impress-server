/**
 * Contatins functionality to enable smart phones 
 * as a remote to control a presentation
 * 
 * @param  {Window} window
 * @param  {Document} document
 * @return {void}
 */
(function(window, document) {

	var Remote = function() {
		this.totalSlides = 0;
		this.currentSlide = 0;
		this.broadcast = false;
		if(window.io) {
			this.setupSocketEvents();
        }
	};

	Remote.prototype.setupSocketEvents = function() {
		var self = this;
		this.socket = window.io.connect();
		this.socket.emit("register:remote");
		
		this.socket.on("goto", function(data) {
			self.currentSlide = data.slide;
		});

		this.socket.on("init:remote", function(data) {
			self.currentSlide = data.slide;
			self.totalSlides = data.totalSlides;
		});

		this.socket.on("mode:presenter", function(data) {
			self.broadcast = data.broadcast || false;
			if(self.broadcast) {
				self.showMenu("release");
			} else {
				self.showMenu("claim");
			}
		});

		this.socket.on("mode:view", function(data) {
			self.broadcast = false;
			self.currentSlide = data.slide;
			self.showMenu("claim");
		});
	}

	Remote.prototype.claimPresenter = function(pass) {
		this.socket.emit("claim:presenter", {slide: this.currentSlide, pass: pass});
	}

	Remote.prototype.releasePresenter = function() {
		this.socket.emit("release:presenter");
	}

	Remote.prototype.next = function() {
		if(this.broadcast) {
			var slide = (this.currentSlide + 1) % this.totalSlides;
			this.socket.emit("goto", {slide: slide});
			this.currentSlide = slide;
		}
	}

	Remote.prototype.prev = function() {
		if(this.broadcast) {
			var slide = (this.currentSlide -1) % this.totalSlides;
			this.socket.emit("goto", {slide: slide});
			this.currentSlide = slide;
		}
	}

	Remote.prototype.showMenu = function(className) {
		var el = document.querySelectorAll(".menu div");
		for(var i=0; i<el.length; i++) {
			el.item(i).style.display = "none";
		}
		document.querySelector("." + className).style.display = "block";
	} 

	/**
	 * Event handling and dom manipulation
	 */
	var api = new Remote(),
		btnLeft = document.querySelector(".btn-left"),
		btnRight = document.querySelector(".btn-right"),
		btnClaim = document.querySelector("#claim"),
		btnRelease = document.querySelector("#release"),
		passField = document.querySelector("#pass"),
		controls = new window.Hammer(document.querySelector(".controls"));

	/**
	 * Button and menu controls
	 */
	btnRight.addEventListener("click", function() {
		event.preventDefault();
		api.next();
	});

	btnLeft.addEventListener("click", function() {
		event.preventDefault();
		api.prev();
	});

	btnClaim.addEventListener("click", function(event) {
		event.preventDefault();
		if(!api.broadcast) {
			api.claimPresenter(passField.value);
		}
	});

	btnRelease.addEventListener("click", function(event) {
		event.preventDefault();
		if(api.broadcast) {
			api.releasePresenter();
		}
	});

	controls.onswipe = function(event) {
		if(event.distance > 70) {
			if(event.direction == "left") {
				api.next();
			} else {
				api.prev();
			}
			event.originalEvent.preventDefault();
		}
	};

})(window, document);