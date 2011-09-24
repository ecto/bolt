var mesh = require('../').name('ralph').connect();

setInterval(function(){
  mesh.emit('fast!');
}, 500);
