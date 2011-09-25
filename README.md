# bolt

Realtime inter-process EventEmitters what?

![bolt](http://i.imgur.com/nMj8o.png)

## Send messages to any process, anywhere on the Internet.

**bolt** intercepts EventEmitter API calls and shares them between processes.

## features

  - Realtime monitoring with bolt-server
  - Autoreconnection
  - Authentication soon

## install

    npm install bolt

## example

Bring it in like this:

    var mesh = require('bolt').connect();

And then you can do things like this in one process:

    mesh.emit('hello');

...and in another process:

    mesh.on('hello', function(){
      console.log('world');
    });

To run the demo, you must have bolt-server running:

    sudo node mesh
    node example
    node example2
    node example3

## methods

### mesh.name(name)

Sets flag to request name from server. If the name is available, the server will allow it.

    var mesh = require('bolt').name('foo').connect();

### mesh.connect(options)

Returns an mesh object, which acts as an analog of an EventEmitter.

Options accepts host and port arguments and defaults to:

    {
      host: '127.0.0.1',
      port: 1234
    }

### mesh.emit(hook, data)

Emit an event to all nodes in the mesh, with JSON, string or integer as data.

### mesh.on(hook, callback)

Watch for an event from self or the mesh. You can get the data from callback(data)

## license

(The MIT License)

Copyright (c) 2011 Cam Pedersen <cam@onswipe.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

