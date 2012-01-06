
var bolt = require('../');

var mesh = new bolt.Node({
  debug: true
});

mesh.start();

setInterval(function(){
  mesh.emit('lol.ping', { hello: 'world' });
  mesh.emit('wut.ping', { hello: 'world' });
}, 2000);

mesh.on('lol.*', function(){
  console.log(arguments);
});
