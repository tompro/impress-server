# Impress.js server

Impress-server enables you to share an [impress.js](http://bartaz.github.com/impress.js/) 
presentation with other users. It is not only a remote control, but every user who opens 
the presentation while it is in presentation mode, will have the state of the presentation 
synced in real time to his browser.

## What problem does it solve ?
In our company we permanently have video conferences with customers. Whenever 
we want to run a presentation for them we have to do this via a screen sharing 
tool. Screen sharing is fine but the quality is poor and it uses a lot of bandwith. 
With impress-server you can run a remote presentation with nearly no bandwidth useage 
at all and in full impress.js quality.

In addition to that, you can use impress-server just to give you the ability to 
remote control your presentation with your phone or another computer.

## Install
Install via NPM:

```bash
npm install impress-server
```

## Prepare presentation
Change into on of your impress presentation folder. Make sure to name your 
presentation file ```index.html```. All other resources for your presentation (like 
images and css) should be put into this directory as well.

Impress-server needs a specific impress.js version to run presentation sharing. 
Starting with impress-server 0.0.8 you no longer need to adopt your presentations html 
file. Just make sure you're loading a ```impress.js``` JavaScript file and you're done.

##Start server
When everything is prepared, start the impress-server by typing:
```bash
impress-server
```
Impress-server also takes arguments for port (-p) and directory (-d) it should serve. 
The server generates a password on startup which you need later to claim the presentation 
mode. You can provide your own password by providing a password (--pw) param at server 
startup.

## Using a mobile device as remote control
Since version 0.0.7, impress-server supports a remote controller. To enable your 
phone to act as a remote, point its browser to your presentation server on the route 
/remote. 

```
http://yourservername:8080/remote
```
You now should see the remote ui. On the bottom of the page you can enter your impress-server 
password and claim the presentation mode. Tapping with your finger on the left/right 
arrows will go to the previous/next page. On Adroid (using Browser, Chrome or Firefox) 
you can also swipe your finger left or right to move forwards or backwards (had no chance 
to test this on an iPhone).

## Sharing a presentation
A presentation is not shared by default but only hosted. Every user visiting 
your presentation can navigate the presentation himself. If you like to switch 
to presentation mode, you currently have to hack your way in :) .

Open your browsers web developer tools (you should know how to do this if you can
 create impress.js presentations) and go to console. Type the following:

```js
api.claimPresenter("your password");
```
The password is shown when you startup your server. If everything works a short message 
should be shown, telling you that you are now in presentation mode. All current and future visitors will be in view only mode from now on. They have to view the slide your browser is currently showing. So you're in god mode now :) .

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
