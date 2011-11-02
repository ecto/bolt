/*
 * Mesh client
 * Cam Pedersen
 * Sept 8, 2011
 */

var net    = require('net'),
    events = require('events'),
    knife  = require('knife');

/*
 * Mesh object is executed immediately for privacy
 */
(function(){
  var mesh = {connected: false, connecting: false},
      messageBuffer = '',
      ee   = new events.EventEmitter(),
      c,
      error_handler;

  module.exports = mesh;

  /*
   * Main entry point for module.
   */
  mesh.connect = function(options){
    if (mesh.connecting || mesh.connected) return mesh;

    mesh.connected = false;
    mesh.connecting = true;

    options = options || {};
    mesh.host = mesh.host || options.host || '127.0.0.1';
    mesh.port = mesh.port || options.port || '1234';

    console.log('Connecting to ' + mesh.host + ':' + mesh.port + '...');

    c = net.createConnection(mesh.port, mesh.host);
    c.on('error', erred);
    c.on('connect', connected);
    c.on('data', incoming);
    c.on('end', disconnected);
    c.on('close', disconnected);

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
   * Special event handler for errors
   */
  mesh.error = function(callback){
    error_handler = callback;
  }

  /*
   * An error occured in the TCP client
   */
  var erred = function(e){
    if (e.code == 'ECONNREFUSED') {
      console.log('Connection refused to mesh server.');
    }
    if (error_handler){
      error_handler(e);
    }
  }

  /*
   * Connected to mesh server
   */
  var connected = function(err){
    if (err) console.log(err);
    else {
      mesh.connecting = false;
      mesh.connected = true;
      console.log('Connected to mesh server.');
    }
  };

  /*
   * A transmission has been recieved from the mesh server
   */
  var incoming = function(m){
    messageBuffer += m.toString();
    var raw = knife.parse(messageBuffer);
    for (var i in raw.result) {
      processMessage(raw.result[i]);
    }
    messageBuffer = raw.remainder;
  }

  /*
   * Do something with a single message
   */
  var processMessage = function(m){
    switch (m.hook) {
      case 'BINIT':
        mesh.id = m.data.id;
        console.log('ID: ' + mesh.id);
        if (mesh.nameBuffer) {
          console.log('Sending name request to server...');
          var reply = {
            id: mesh.id,
            hook: 'BCHANGENAME',
            data: {
              name: mesh.nameBuffer
            }
          }
          c.write(JSON.stringify(reply));
        }
        break;
      case 'BNAMEACCEPT':
        if (m.data.name != mesh.nameBuffer) {
          console.log('Server did not accept name request. Accepting server-provided ID: ' + m.data.id);
        } else {
          console.log('Server accepted name request.');
        }
        mesh.id = m.data.name;
        console.log('ID: ' + mesh.id);
        break;
      default:
        ee.emit(m.hook, m.data);
        break;
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

