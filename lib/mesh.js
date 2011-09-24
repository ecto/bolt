/*
 * Mesh client
 * Cam Pedersen
 * Sept 8, 2011
 */

var net    = require('net'),
    events = require('events');

/*
 * Mesh object is executed immediately for privacy
 */
(function(){
  var mesh = {},
      ee   = new events.EventEmitter(),
      c;

  module.exports = mesh;

  /*
   * Main entry point for module.
   */
  mesh.connect = function(host, port){
    mesh.host = host || '127.0.0.1',
    mesh.port = port || '1234',
    console.log('Connecting to ' + mesh.host + ':' + mesh.port + '...');
    c = net.createConnection(mesh.port, mesh.host);
    //c = new net.Socket();
    //c.connect(mesh.port, mesh.host);
    c.on('error', erred);
    c.on('connect', connected);
    c.on('data', incoming);
    c.on('end', disconnected);
    c.on('close', disconnected);
    return mesh;
  }

  /*
   * Intercept and register an event with the ee
   */
  mesh.on = function(hook, callback){
    return ee.on(hook, callback);
  }

  /*
   * Intercept emission and send to server
   */
  mesh.emit = function(hook, data){
    var m = {
      id: mesh.id,
      hook: hook,
      data: data
    }
    c.write(JSON.stringify(m));
    console.log(m);
    return ee.emit(hook, data);
  }

  /*
   * An error occured in the TCP client
   */
  var erred = function(e){
    throw new Error(e);
  }

  /*
   * Connected to mesh server
   */
  var connected = function(err){
    if (err) console.log(err);
    else console.log('Connected to mesh server.');
  };

  /*
   * A message has been recieved from the mesh server
   */
  var incoming = function(m){
    var m = m.toString();
    if (!mesh.id) {
      mesh.id = m;
      console.log('ID: ' + m);
    } else {
      try {
        var m = JSON.parse(m);
        ee.emit(m.hook, m.data);
      } catch (e) {
        console.log('Could not parse: ' + m);
      }
    }
  };

  /*
   * We have been disconnected from the mesh server
   * Freeze state and trigger new connection
   */
  var disconnected = function(err){
    if (err) console.log(err);
    console.log('Disconnected from mesh...');
  }

  /*
   * Catch-all for errors
   */
  //process.on('uncaughtException', function(e){
    //console.log(e);
  //  throw new Error(e);
  //});

})();

