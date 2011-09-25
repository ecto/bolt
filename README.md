# bolt

Realtime inter-process EventEmitters what?

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

To run the demo, you must have :

    sudo node mesh
    node example
    node example2
    node example3

## API

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
