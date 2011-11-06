var bolt = require('../');

var mesh = new bolt.Node();

mesh.start();

setInterval(function(){
  mesh.emit('fast!');
}, 500);
