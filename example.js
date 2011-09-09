var mesh = require('mesh').connect();

mesh.on('ping', function(){
  mesh.emit('pong');
});

mesh.on('pong', function(){
  console.log('pong');
});

setInterval(function(){
  mesh.emit('ping');
}, 1000);
