var bolt = require('../');

var mesh = new bolt.Node({
  debug: false
});

mesh.start();

setInterval(function(){
  mesh.emit('ping', { hello: 'world' });
}, 2000);

mesh.on('pong', function(data){
  console.log('Recieved pong!');
});
