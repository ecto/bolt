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
  var mesh = {connected: false, connecting: false},
      delimiter = '::::/bm/::::',
      ee   = new events.EventEmitter(),
      c;

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
    if (name.indexOf('::') != -1) throw new Error('Name cannot contain ::');
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

    c.write(JSON.stringify(m) + delimiter);

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
      mesh.connecting = false;
      mesh.connected = true;
      console.log('Connected to mesh server.');
    }
  };

  /*
   * Do something with a single message
   */
  var processMessage = function(m){
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
        c.write(JSON.stringify(nm) + delimiter);
      }
    } else if (m.indexOf('BNAMEACCEPT') != -1) {
      var raw = m.split('::');
      if (raw[1] != mesh.nameBuffer) {
        console.log('Server did not accept name request. Accepting server-provided ID: ' + raw[1]);
      } else {
        console.log('Server accepted name request.');
      }
      mesh.id = raw[1];
      console.log('ID: ' + mesh.id);
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
   * A transmission has been recieved from the mesh server
   */
  var incoming = function(m){
    m = m.toString();
    var raw = m.split(delimiter);
    if (raw.length > 1) raw.pop();
    for (var i in raw) {
      processMessage(raw[i]);
    }
  }

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

