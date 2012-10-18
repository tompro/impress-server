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
		controls = document.querySelector(".controls"),
		touchStart, touchMove;

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

	/**
	 * Swipe controls here
	 */
	
	controls.addEventListener('touchstart', function(event) {
		if(event.touches.length > 0) {
			touchStart = event.touches[0];
		}
	}, false);

	controls.addEventListener('touchmove', function(event) {
		event.preventDefault();
		if(event.touches.length > 0) {
			touchMove = event.touches[0];
		}
	}, false);

	controls.addEventListener('touchend', function(event) {
		if(event.changedTouches && event.changedTouches.length > 0) {
			touchMove = event.changedTouches[0];
		}
		if(touchMove && touchStart) {
			var distance = touchMove.pageX - touchStart.pageX;
			if(Math.abs(distance) > 70) {
				if(distance > 0) {
					api.prev();
				} else {
					api.next();
				}
			}
		}
		touchMove = null;
		touchStart = null;
	}, false);

})(window, document);