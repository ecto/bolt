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
 * Render a page displaying the status of the mesh
 */
app.get('/', function(req, res){
  res.send(pool);
});
app.listen(80);

/*
 * TCP server
 * Handle all mesh nodes
 * Broadcast emissions
 * Send whispers discretely
 */
var server = net.createServer(connect);
server.listen(1234, function(c){
  console.log('Mesh server started...');
});

/*
 * Allow a node to connect
 * Generate a name for the node
 * Add node to pool
 * Send confirmation
 */
var connect = function (c) {
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
};

/*
 * Allow a node to disconnect
 * Remove from pool and send confirmation
 */
var disconnect = function(){
  delete pool[this.id];
  console.log(this.id + ' disconnected');
}

/*
 * TCP server recieved data
 * Handle event emissions
 * Handle node whipsers
 */
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

/*
 * Broadcast a message to all nodes
 */
function broadcast(message) {
  setTimeout(function(){ // to not wait for loop to finish
    for (var i in pool) {
      pool[i].c.write(message);
    }
  }, 1);
}

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

