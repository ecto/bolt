var bolt = require('../');

var mesh = new bolt.Node();

mesh.start();

mesh.on('ping', function(){
  mesh.emit('pong');
});

setInterval(function(){},10000); //keep-alive
