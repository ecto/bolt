#node-mesh

Realtime inter-process EventEmitters what?

## Send messages to any process, anywhere on the Internet.

This isn't a real mesh. **node-mesh** simply intercepts EventEmitter API calls and shares them between processes.

Bring it in like this:

    var mesh = require('mesh').connect();

And then you can do things like this in one process:

    mesh.emit('hello');

...and in another process:

    mesh.on('hello', function(){
      console.log('world');
    });

To run the demo:

    sudo ./mesh.sh
    node example.js
    node example2.js

## API

### mesh.connect(host, port)

Returns an mesh object, which acts as an analog of an EventEmitter.

### mesh.emit(hook, data)

Emit an event to all nodes in the mesh, with JSON, string or integer as data.

### mesh.on(hook, callback)

Watch for an event from self or the mesh. You can get the data from callback(data)
