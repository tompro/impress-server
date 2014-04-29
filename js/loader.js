/**
 * Loads additional js resources asyc and inits impress remote events
 * @param  {Document} document
 * @param  {Window} window
 */
(function(document, window) {
	var deps = [
			"/socket.io/socket.io.js",
			"/js/remote.events.js",
		],
		head = document.querySelector('head'),
		body = document.querySelector('body'),
		i, loaded = 0, impressApi;

	// impress.js may be loaded in head or body
	// if loaded in head, body is not ready yet
	var target = body ? body : head;

	if(target) {
		for(i=0; i< deps.length; i++) {
			var script = document.createElement('script');
			script.onload = function() {
				loaded ++;
				if(loaded >= deps.length) {
					if(impressApi) {
						initRemoteEvents(impressApi);
					}
				}
			};
			script.src = deps[i];
			target.appendChild(script);
		}
	}

	document.addEventListener("impress:init", function (event) {
		impressApi = event.detail.api;
		if(loaded === deps.length) {
			initRemoteEvents(impressApi);
		}
	});

})(document, window);