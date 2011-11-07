var bolt = require('../');

var mesh = new bolt.Node({
  auth: 'my redis password'
});

mesh.start();

setInterval(function(){
  mesh.emit('i authenticated!');
}, 500);
