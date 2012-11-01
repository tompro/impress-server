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
		body = document.querySelector('body'),
		i, loaded = 0, impressApi;

	if(body) {
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
			body.appendChild(script);
		}
	}

	document.addEventListener("impress:init", function (event) {
		impressApi = event.detail.api;
		if(loaded === deps.length) {
			initRemoteEvents(impressApi);
		}
	});

})(document, window);