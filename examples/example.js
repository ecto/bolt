var mesh = require('../').connect();

setInterval(function(){
  mesh.emit('ping', { hello: 'world' });
}, 2000);

mesh.on('pong', function(data){
  console.log('Recieved pong!');
});
