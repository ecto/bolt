# bolt

Distributed realtime EventEmitters through Redis pubsub what

![bolt](http://i.imgur.com/nMj8o.png)

## Send messages to any process, anywhere on the Internet.

**bolt** intercepts EventEmitter API calls and shares them between processes.

## features

  - Realtime monitoring with **bolt-monitor**
  - Autoreconnection
  - Authentication
  - Event stream piping (soon) (pull request!)
  - Remote Method Invocation (soon) (pull request!)
  - Method sharing through function decomposition and reconstruction across nodes (soon) (pull request!)

## install

    npm install bolt

## example

Bring it in like this:

````javascript
var bolt = require('bolt');

var mesh = new bolt.Node();

mesh.start();
````

And then you can do things like this in one process:

````javascript
mesh.emit('hello');
````

...and in another process:

````javascript
mesh.on('hello', function(){
  console.log('world');
});
````

I'm working on getting more functionality in the examples folder, but those there should still prove useful.

## philosophy

**bolt**'s main functionality lies in its Node class. Each instance of a Node can send and receive events.

Each Node connects to a Redis server and opens two connections, an incoming subscription channel, and an outgoing publish and command channel.

When instantiating a single Node, it is convention to name it `mesh`, reinforcing the paradigm of interconnected Nodes.

It is possible to instantiate an army of Nodes from a single process, only limited by your open file limit (`ulimit -a`) and Redis's maxconn setting.

If you would like to share events with the browser, it is preferable to use **bolt.js**, though you can also hijack the socket.io stream from **bolt-monitor** if you're feeling hackish.

## methods

### var node = new bolt.Node(options)

`options` defaults to:

````javascript
{
  host: '127.0.0.1',
  port: 6357,
  debug: false,
  silent: false,
  auth: undefined
}
````

### node.start()

Create incoming and outgoing Redis connections, open the floodgates for events.

It is customary to define event listeners before calling this method.

### node.emit(hook, data)

Emit an event to all nodes in the mesh, with JSON, string or integer as data.

### node.on(hook, callback)

Watch for an event from self or the mesh. You can get the data from callback(data)

You can provide an error handler for Bolt to prevent it from throwing:

````javascript
mesh.on('error', function (e) {
  console.log(e);
});
````

## license

(The MIT License)

Copyright (c) 2011 Cam Pedersen <cam@onswipe.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

