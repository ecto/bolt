/*
 * Mesh client
 * Cam Pedersen
 * Sept 8, 2011
 */

var net    = require('net'),
    events = require('events');

/*
 * Flatten an arguments object into an array, excluding the first argument
 */
function flatten(args){
  var r = [];
  for(var i = 1, l = args.length; i < l; i++){
    r.push(args[i]);
  }
  return r;
}

/*
 * If the first argument is true, call console.log with all but the
 * first argument
 */
function debug(){
  if (arguments[0]) console.log.apply(console, flatten(arguments));
}

/*
 * Mesh object is executed immediately for privacy
 */
(function(){
  var mesh = {connected: false, connecting: false},
      delimiter = '::::/bm/::::',
      ee   = new events.EventEmitter(),
      c,
      _debug;

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

    debug(_debug, 'Connecting to ' + mesh.host + ':' + mesh.port + '...');

    c = net.createConnection(mesh.port, mesh.host);
    c.on('error', erred);
    c.on('connect', connected);
    c.on('data', incoming);
    c.on('end', disconnected);
    c.on('close', disconnected);

    return mesh;
  }

  /*
   * Turn debug on or off
   */
  mesh.debug = function(d){
    _debug = d;
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
      debug(_debug, 'Connection refused to mesh server.');
    } else {
      debug(_debug, e);
    }
  }

  /*
   * Connected to mesh server
   */
  var connected = function(err){
    if (err) debug(_debug, err);
    else {
      mesh.connecting = false;
      mesh.connected = true;
      debug(_debug, 'Connected to mesh server.');
    }
  };

  /*
   * Do something with a single message
   */
  var processMessage = function(m){
    if (!mesh.id) {
      mesh.id = m;
      debug(_debug, 'ID: ' + m);
      if (mesh.nameBuffer) {
        debug(_debug, 'Sending name request to server..');
        var nm = {
          id: mesh.id,
          hook: 'BCHANGENAME',
          name: mesh.nameBuffer
        }
        c.write(JSON.stringify(nm));
      }
    } else if (m.indexOf('BNAMEACCEPT') != -1) {
      var raw = m.split('::');
      if (raw[1] != mesh.nameBuffer) {
        debug(_debug, 'Server did not accept name request. Accepting server-provided ID: ' + raw[1]);
      } else {
        debug(_debug, 'Server accepted name request.');
      }
      mesh.id = raw[1];
      debug(_debug, 'ID: ' + mesh.id);
    } else {
      try {
        var m = JSON.parse(m);
        ee.emit(m.hook, m.data);
      } catch (e) {
        debug(_debug, 'Could not parse:');
        debug(_debug, m);
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
    if (err && err != true) debug(_debug, err);
    mesh.connected = false;
    delete mesh.id;
    if (!mesh.connecting) {
      setTimeout(mesh.connect, 3000);
      debug(_debug, 'Retrying mesh connection in 3 seconds...');
      debug(_debug, '');
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

