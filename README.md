# Impress.js server

Impress-server enables you to share an [impress.js](https://github.com/bartaz/impress.js/) 
presentation with other users. It is not a remote control but every user who opens 
the presentation while it is in presentation mode will have the state of the presentation 
synced in real time to his browser.

## What problem does it solve ?
In our company we permanently have video conferences with customers. Whenever 
we want to run a presentation for them we have to do this via a screen sharing 
tool. Screen sharing is fine but the quality is poor and it uses a lot of bandwith. 
With impress-server you can run a remote presentation with nearly no bandwidth useage 
at all and in full impress.js quality.

## Install
Install via NPM:

```bash
npm install impress-server
```

## Prepare presentation
Change into on of your impress presentation folders. Make sure to name your 
presentation file index.html. All other resources for your presentation (like 
images and css) should be put into this directory as well.

Impress-server needs a specific impress.js version to run presentation sharing. 
So change the impress script source to the server version and also include, 
socket.io and remote.events.js in your index.html.

```html
<script src="/js/impress.js"></script>
<script src="/socket.io/socket.io.js"></script>
<script src="/js/remote.events.js"></script>
```

##Start server
When everything is prepared start the impress-server by typing:
```bash
impress-server
```
Impress-server also take arguments for port (-p) and directory (-d) it should serve.

## Sharing a presentation
A presentation is not shared by default but only hosted. Every user visiting 
your presentation can navigate the presentation himself. If you like to switch 
to presentation mode, you currently have to hack your way in :) .

Open your browsers web developer tools (you should know how to do this if you can
 create impress.js presentations) and go to console. Type the following:

```js
api.claimPresenter();
```
If everything works a short message should be shown, telling you that 
you are now in presentation mode. All current and future visitors will be in view 
only mode from now on. They have to view the slide your browser is currently showing. 
So you're in god mode now :) .

There are several other api commands you can use:
```js
// stop presentation mode, all users can navigate on their own
api.releasePresenter();

// a user in view mode can exit view mode and navigate himself
api.ignorePresenter();

// a user who previously ignored the presenter can refollow the presentation
api.followPresenter();

// navigate the presentation
api.next();
api.prev();
api.goto(2);
```

## License 

(The MIT License)

Copyright (c) 2012 Thomas Profelt &lt;office@protom.eu&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
