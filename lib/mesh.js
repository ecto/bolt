/*
 * Mesh client
 * Cam Pedersen
 * Sept 8, 2011
 */

var net    = require('net'),
    events = require('events');

var DELIMITER = '::::/bm/::::';

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

module.exports = function(options){

  options.host = options.host || '127.0.0.1';
  options.port = options.port || '1234';

  debug(options.debug, 'Connecting to ' + options.host + ':' + options.port + '...');

  var mesh = { connected: false, connecting: true },
      c = net.createConnection(options.port, options.host),
      ee = new events.EventEmitter();

  c.on('error', erred);
  c.on('connect', connected);
  c.on('data', incoming);
  c.on('end', disconnected);
  c.on('close', disconnected);

  if (options.name){
    if (options.name.indexOf('::') != -1) throw new Error('Name cannot contain ::');
    if (typeof options.name == 'string') mesh.nameBuffer = options.name;
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

    c.write(JSON.stringify(m) + DELIMITER);

    return ee.emit(hook, data);
  }

  /*
   * An error occured in the TCP client
   */
  function erred(e){
    if (e.code == 'ECONNREFUSED') {
      debug(options.debug, 'Connection refused to mesh server.');
    } else {
      debug(options.debug, e);
    }
  }

  /*
   * Connected to mesh server
   */
  function connected(err){
    if (err) debug(options.debug, err);
    else {
      mesh.connecting = false;
      mesh.connected = true;
      debug(options.debug, 'Connected to mesh server.');
    }
  };

  /*
   * Do something with a single message
   */
  function processMessage(m){
    if (!mesh.id) {
      mesh.id = m;
      debug(options.debug, 'ID: ' + m);
      if (mesh.nameBuffer) {
        debug(options.debug, 'Sending name request to server..');
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
        debug(options.debug, 'Server did not accept name request. Accepting server-provided ID: ' + raw[1]);
      } else {
        debug(options.debug, 'Server accepted name request.');
      }
      mesh.id = raw[1];
      debug(options.debug, 'ID: ' + mesh.id);
    } else {
      try {
        var m = JSON.parse(m);
        ee.emit(m.hook, m.data);
      } catch (e) {
        debug(options.debug, 'Could not parse:');
        debug(options.debug, m);
      }
    }
  };

  /*
   * A transmission has been recieved from the mesh server
   */
  function incoming(m){
    m = m.toString();
    var raw = m.split(DELIMITER);
    if (raw.length > 1) raw.pop();
    for (var i in raw) {
      processMessage(raw[i]);
    }
  }

  /*
   * We have been disconnected from the mesh server
   * Freeze state and trigger new connection
   */
  function disconnected(err){
    if (err && err != true) debug(options.debug, err);
    mesh.connected = false;
    delete mesh.id;
    if (!mesh.connecting) {
      setTimeout(mesh.connect, 3000);
      debug(options.debug, 'Retrying mesh connection in 3 seconds...');
      debug(options.debug, '');
    }
  }

  /*
   * Catch-all for errors
   */
  //process.on('uncaughtException', function(e){
    //console.log(e);
  //  throw new Error(e);
  //});

  return mesh;

};
