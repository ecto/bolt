var bolt = require('../');

var mesh = new bolt.Node({
  silent: true
});

mesh.start();

setInterval(function(){
  mesh.emit('no logging!');
}, 500);
