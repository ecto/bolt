#!/usr/bin/env node

/*
 * Mesh server
 * Cam Pedersen
 * Sept 8, 2011
 * Written on a plane from SFO to JFK
 *
 * Keep a pool of all nodes, handling mesh protocol
 * Disperse event emissions to all nodes in mesh
 * Don't fuck up
 */

var crypto  = require('crypto'),
    express = require('express'),
    app     = express.createServer(),
    net     = require('net'),
    rack    = require('hat').rack(),
    pool    = [];

/*
 * HTTP server
 */
app.get('/', function(req, res){
  res.send(pool);
});
app.listen(80);

/*
 * TCP server
 */
var server = net.createServer(function (c) {
  var id = rack();
  c.write(id);
  c.on('data', incoming);
  c.on('close', disconnected);
  c.id = id;
  pool[id] = {
    c: c,
    join: +new Date()
  }
  console.log(id + ' connected');
});

var incoming = function(m){
  m = m.toString();
  try {
    var message = JSON.parse(m);
    console.log(message.id + ' emitted ' + message.hook);
    broadcast(m);
  } catch (e) {
    console.log('Could not parse: ' + m);
  }
};

var disconnected = function(){
  delete pool[this.id];
  console.log(this.id + ' disconnected');
  console.log(pool.length);
}

server.listen(1234, function(c){
  console.log('Mesh server started...');
});

function broadcast(message) {
  setTimeout(function(){ // to not wait for loop to finish
    for (var i in pool) {
      pool[i].c.write(message);
    }
  }, 1);
}

/*
 * Allow a node to connect
 * Generate a name for the node
 * Add node to pool
 * Send confirmation
 *
 * \connect
 */

/*
 * Allow a node to disconnect
 * Remove from pool and send confirmation
 *
 * \disconnect
 */

/*
 * Node has emitted an event
 * Disperse event to all nodes
 *
 * \emission
 */

/*
 * Generate a unique name for a node
 */
function generateID(seed){
  var exists = false,
      uid    = '';

  uid = crypto
        .createHash('sha1')
        .update(pool.length.toString())
        .digest('base64');

  uid.length = 10;
  console.log(uid);

  for (var i in pool) {
    if (pool[i].name === raw) {
      exists = true;
      break;
    }
  }

  if (!exists) return uid;
  else generateID();
}

