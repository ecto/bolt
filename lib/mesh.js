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
  mesh.connect = function(options){
    mesh.connected = false;

    options = options || {};
    mesh.host = options.host || '127.0.0.1';
    mesh.port = options.port || '1234';

    console.log('Connecting to ' + mesh.host + ':' + mesh.port + '...');

    c = net.createConnection(mesh.port, mesh.host);
    c.on('error', erred);
    c.on('connect', connected);
    c.on('data', incoming);
    c.on('end', disconnected);
    c.on('close', disconnected);

    mesh.connecting = false;

    return mesh;
  }

  /*
   * Send server a name request
   */
  mesh.name = function(name){
    if (typeof name != 'string') return mesh;
    mesh.nameBuffer = name;
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
    if (!mesh.connected) return;

    var m = {};
    m.id = mesh.id;
    m.hook = hook;
    m.data = data;

    c.write(JSON.stringify(m));

    return ee.emit(hook, data);
  }

  /*
   * An error occured in the TCP client
   */
  var erred = function(e){
    if (e.code == 'ECONNREFUSED') {
      console.log('Connection refused to mesh server.');
    } else {
      console.log(e);
    }
  }

  /*
   * Connected to mesh server
   */
  var connected = function(err){
    if (err) console.log(err);
    else {
      mesh.connected = true;
      console.log('Connected to mesh server.');
    }
  };

  /*
   * A message has been recieved from the mesh server
   */
  var incoming = function(m){
    var m = m.toString();
    if (!mesh.id) {
      mesh.id = m;
      console.log('ID: ' + m);
      if (mesh.nameBuffer) {
        console.log('Sending name request to server..');
        var nm = {
          id: mesh.id,
          hook: 'BCHANGENAME',
          name: mesh.nameBuffer
        }
        c.write(JSON.stringify(nm));
      }
    } else if (m == 'BNAMEACCEPT') {
      mesh.id = mesh.nameBuffer;
      console.log('ID: ' + mesh.nameBuffer);
    } else {
      try {
        var m = JSON.parse(m);
        ee.emit(m.hook, m.data);
      } catch (e) {
        console.log('Could not parse:');
        console.log(m);
      }
    }
  };

  /*
   * We have been disconnected from the mesh server
   * Freeze state and trigger new connection
   */
  var disconnected = function(err){
    if (err && err != true) console.log(err);
    mesh.connected = false;
    delete mesh.id;
    if (!mesh.connecting) {
      mesh.connecting = true;
      setTimeout(mesh.connect, 3000);
      console.log('Retrying mesh connection in 3 seconds...');
      console.log('');
    }
  }

  /*
   * Catch-all for errors
   */
  //process.on('uncaughtException', function(e){
    //console.log(e);
  //  throw new Error(e);
  //});

})();

