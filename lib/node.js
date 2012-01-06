var net    = require('net'),
    ee     = require('eventemitter2').EventEmitter2,
    redis  = require('redis'),
    colors = require('colors');
    
var node = function(options){
  options = options || {};
  this.host = options.host || '127.0.0.1';
  this.port = options.port || '6379';
  this.auth = options.auth || undefined;
  this.channel = options.channel || 'bolt::main';
  this.debug = options.debug == undefined ? false : options.debug;
  this.silent = options.silent ? true : false;
  this.outgoingMessageBuffer = [];
  this.errorHandler = null;
  this.c = null;
  this.ee = new ee({
    delimiter: options.delimiter || '.',
    maxListeners: options.maxListeners || 20,
    wildcard: options.wildcard || '*'
  });
  return this;
}

node.prototype.start = function(){
  this.log('info', 'redis', 'attempting connection to ' + this.host + ':' + this.port + '...');

  this.i = redis.createClient(this.port, this.host);
  this.o = redis.createClient(this.port, this.host);
  if (this.auth) {
    this.log('info', 'redis', 'authenticating');
    this.i.auth(this.auth);
    this.o.auth(this.auth);
  }

  var that = this;

  this.i.on('error', function(e) {
    that.error('redis', e);
  });
  this.o.on('error', function(e) {
    that.error('redis', e);
  });

  this.i.on('connect', function() {
    that.log('info', 'redis', 'inbound connected');
    that.log('info', 'redis', 'attempting subscription to ' + that.channel);
    that.i.subscribe(that.channel);
  });

  this.o.on('connect', function() {
    that.log('info', 'redis', 'outbound connected');
  });

  this.i.on('subscribe', function(){
    that.log('info', 'redis', 'inbound subscribed to ' + that.channel);
  });

  this.i.on('message', function(channel, message){
    that.log('debug', channel, message);
    that.receive(that, channel, message);
  });

  return this;
}

node.prototype.log = function(level, event, message) {
  if (this.silent) return;

  if (!message && event) {
    message = event;
  }

  if (!event && level) {
    message = level;
  }

  message = event ? event.grey + ' ' + message : message;

  switch (level) {
    case 'debug':
      if (this.debug) console.log('bolt'.magenta + ' debug '.blue + message);
      break;
    case 'info':
    default:
      console.log('bolt'.magenta + ' info '.blue + '' + message);
      break;
  }
}

node.prototype.on = function(hook, callback){
  if (hook == 'error') {
    errorHandler = callback;
  }
  return this.ee.on(hook, callback);
}

node.prototype.emit = function(hook, data){
  var m = {};
  m.hook = hook;
  m.data = data;


  if (!this.o.connected) {
    this.log('debug', 'queueing', JSON.stringify(m));
    this.outgoingMessageBuffer.push.apply(m);
  } else {
    this.log('debug', 'emitting', JSON.stringify(m));
    this.o.publish(this.channel, JSON.stringify(m));
  }

  return this.ee.emit(hook, data);
}

node.prototype.error = function(source, e){
  if (!e && source) {
    e = source;
    delete source;
  }

  this.log('error', source, e);
  if (this.errorHandler){
    this.errorHandler.call(source, e);
  }
  process.exit();
}

node.prototype.subscribed = function(){
  console.log(arguments);
}

node.prototype.receive = function(that, channel, message){
  try {
    message = JSON.parse(message);
  } catch (e) {
    console.log([message, e]);
  }

  if (message) {
    that.ee.emit(message.hook, message.data);
  }
}

module.exports = node;
