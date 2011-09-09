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
    pool    = [];

/*
 * Render a page displaying the status of the mesh
 */
app.get('/', function(req, res){
  res.send(pool);
});

/*
 * Allow a node to connect
 * Generate a name for the node
 * Add node to pool
 * Send confirmation
 */
app.post('/connect', function(req, res){
  console.log(res);
  res.send('OK');
});

/*
 * Allow a node to disconnect
 * Remove from pool and send confirmation
 */
app.post('/disconnect', function(req, res){
});

/*
 * Node has emitted an event
 * Disperse event to all nodes
 */
app.post('/emission', function(req, res){

});

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

app.listen(1234);
