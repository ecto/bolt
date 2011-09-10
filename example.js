var mesh = require('mesh').connect();

mesh.on('pong', function(){
  console.log('pong');
});

setInterval(function(){
  mesh.emit('ping');
}, 1000);
