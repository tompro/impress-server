/**
 * Exports a wrapper class for impress api to syncronize 
 * impress api call over several clients
 * 
 * @param  {Document} document
 * @param  {Window} window
 * @return {RemoteApi}
 */
var RemoteApi = (function(document, window) {
    'use strict';

    function RemoteApi(api) {
        this.presenter = true;
        this.broadcast = false;
        this.ignore = false;

        this.api = api;
        this.steps = document.querySelectorAll('.step');
        this.hint = document.querySelector('.hint');

        if(window.io) {
            this.socket = window.io.connect();
            this.setupSocketEvents();
            this.emit("register:viewer", {totalSlides: this.steps.length});
        } else {
            this.presenter = true;
        }
        
    };

    RemoteApi.prototype.currentSlide = function() {
        var index = this.getIndex(document.querySelector('.step.active'));
        if(index < 0) index = 0;
        return index;
    };

    RemoteApi.prototype.getIndex = function( el ) {
        return Array.prototype.indexOf.call(this.steps, el);
    };

    RemoteApi.prototype.goto = function( el, duration ) {
        var slide = this.getIndex(el);
        if(this.presenter && slide != -1) {
            if(this.broadcast) {
                this.emit("goto", {slide: slide, duration: duration});
            }

            this.api.goto(el, duration);
        }
    };

    RemoteApi.prototype.claimPresenter = function(pass) {
        this.emit("claim:presenter", {slide: this.currentSlide(), pass: pass});
    }

    RemoteApi.prototype.releasePresenter = function() {
        this.emit("release:presenter");
    }

    RemoteApi.prototype.ignorePresenter = function() {
        if(!this.presenter && !this.broadcast) {
            this.presenter = true;
            this.ignore = true;
            this.showHint("You can now navigate the presentation yourself");
        }
    }

    RemoteApi.prototype.followPresenter = function() {
        if(this.presenter && !this.broadcast && this.ignore) {
            this.ignore = false;
            this.emit('follow:presenter');
        }
    }

    RemoteApi.prototype.next = function() {
        if(this.presenter) {
            var slide = (this.currentSlide() + 1) % this.steps.length;
            if(this.broadcast) {
                this.emit("goto", {slide: slide});
            }
            this.api.goto(slide);
        }
    };

    RemoteApi.prototype.prev = function() {
        if(this.presenter) {
            var slide = (this.currentSlide() -1) % this.steps.length;
            if(slide < 0) {
                slide = this.steps.length + slide;
            }
            if(this.broadcast) {
                this.emit("goto", {slide: slide});
            }
            this.api.goto(slide);
        }
    };

    RemoteApi.prototype.emit = function(type, data) {
        if(this.socket) {
            this.socket.emit(type, data);
        }
    };

    RemoteApi.prototype.setupSocketEvents = function() {
        var self = this;

        this.socket.on("goto", function(data) {
            if( ! self.presenter ) {
                self.api.goto(data.slide, data.duration);
            }
        });

        this.socket.on("mode:view", function(data) {
            if( ! self.ignore ) {
                self.presenter = false;
                self.api.goto(data.slide);
                self.showHint("You are now in view only mode");
            }
        });

        this.socket.on("mode:presenter", function(data) {
            var wasPresenter = self.presenter;
            self.presenter = true;
            self.broadcast = data.broadcast;
            if(self.broadcast) {
                self.showHint("You are now in presentation mode");
            } else if( ! wasPresenter ) {
                self.showHint("Presentation mode has ended");
            }
        });
    };

    RemoteApi.prototype.showHint = function( msg, time ) {
        var self = this, time = time || 3000;
        if(this.hint) {
            self.hint.innerHTML = "<p>" + msg + "</p>";
            this.hint.style.display = 'block';
            setTimeout(function() {
                self.hint.style.display = 'none';
            }, time);
        }
    };

    return RemoteApi;

})(document, window);

/**
 * Setup events like in original impress.js but use RemoteApi as wrapper 
 * for impress api.
 * 
 * @param  {Document} document
 * @param  {Window} window
 * @return {void}
 */
var initRemoteEvents = (function (document, window){
    // throttling function calls, by Remy Sharp
    // http://remysharp.com/2010/07/21/throttling-function-calls/
    var throttle = function (fn, delay) {
        var timer = null;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        };
    };

    // wait for impress.js to be initialized
    return function (impressApi) {
        
        var api = new window.RemoteApi(impressApi);
        window.api = api;

        // Prevent default keydown action when one of supported key is pressed.
        document.addEventListener("keydown", function ( event ) {
            if ( event.keyCode === 9 || ( event.keyCode >= 32 && event.keyCode <= 34 ) || (event.keyCode >= 37 && event.keyCode <= 40) ) {
                event.preventDefault();
            }
        }, false);

        // Trigger impress action (next or prev) on keyup.
        document.addEventListener("keyup", function ( event ) {
            if ( event.keyCode === 9 || ( event.keyCode >= 32 && event.keyCode <= 34 ) || (event.keyCode >= 37 && event.keyCode <= 40) ) {
                switch( event.keyCode ) {
                    case 33: // pg up
                    case 37: // left
                    case 38: // up
                             api.prev();
                             break;
                    case 9:  // tab
                    case 32: // space
                    case 34: // pg down
                    case 39: // right
                    case 40: // down
                             api.next();
                             break;
                }
                
                event.preventDefault();
            }
        }, false);
        
        // delegated handler for clicking on the links to presentation steps
        document.addEventListener("click", function ( event ) {
            // event delegation with "bubbling"
            // check if event target (or any of its parents is a link)
            var target = event.target;
            while ( (target.tagName !== "A") &&
                    (target !== document.documentElement) ) {
                target = target.parentNode;
            }
            
            if ( target.tagName === "A" ) {
                var href = target.getAttribute("href");
                
                // if it's a link to presentation step, target this step
                if ( href && href[0] === '#' ) {
                    target = document.getElementById( href.slice(1) );
                }
            }
            
            if ( api.goto(target) ) {
                event.stopImmediatePropagation();
                event.preventDefault();
            }
        }, false);
        
        // delegated handler for clicking on step elements
        document.addEventListener("click", function ( event ) {
            var target = event.target;
            // find closest step element that is not active
            while ( !(target.classList.contains("step") && !target.classList.contains("active")) &&
                    (target !== document.documentElement) ) {
                target = target.parentNode;
            }
            
            if ( api.goto(target) ) {
                event.preventDefault();
            }
        }, false);
        
        // touch handler to detect taps on the left and right side of the screen
        // based on awesome work of @hakimel: https://github.com/hakimel/reveal.js
        document.addEventListener("touchstart", function ( event ) {
            if (event.touches.length === 1) {
                var x = event.touches[0].clientX,
                    width = window.innerWidth * 0.3,
                    result = null;
                    
                if ( x < width ) {
                    result = api.prev();
                } else if ( x > window.innerWidth - width ) {
                    result = api.next();
                }
                
                if (result) {
                    event.preventDefault();
                }
            }
        }, false);
        
        // rescale presentation when window is resized
        window.addEventListener("resize", throttle(function () {
            // force going to active step again, to trigger rescaling
            api.goto( document.querySelector(".active"), 500 );
        }, 250), false);
        
    };

})(document, window);