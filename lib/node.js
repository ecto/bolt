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
  this.debug = options.debug === undefined ? false : options.debug;
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
};

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
    while (that.outgoingMessageBuffer.length > 0) {
      var m = that.outgoingMessageBuffer.shift();
      that.emit(m.hook, m.data);
    }
  });

  this.i.on('reconnecting', function(data){
    that.log('info', 'redis', 'inbound reconnecting');
    that.log('info', 'redis', '  attempt: ' + data.attempt);
    that.log('info', 'redis', '  delay:   ' + data.delay);
  });
  this.o.on('reconnecting', function(data) {
    that.log('info', 'redis', 'outbound reconnecting');
    that.log('info', 'redis', '  attempt: ' + data.attempt);
    that.log('info', 'redis', '  delay:   ' + data.delay);
  });

  this.i.on('subscribe', function(){
    that.log('info', 'redis', 'inbound subscribed to ' + that.channel);
  });

  this.i.on('message', function(channel, message){
    that.log('debug', channel, message);
    that.receive(that, channel, message);
  });

  return this;
};

node.prototype.log = function(level, event, message) {
  if (this.silent) return;

  if (!message) {
    message = event;
  } else {
    message = event.grey + ' ' + message;
  }

  if (level === 'debug' && this.debug) {
    console.log('bolt'.magenta + ' debug '.blue + message);
  } else if (level === 'error') {
    console.log('bolt'.magenta + ' error '.red + message);
  } else {
    console.log('bolt'.magenta + ' info '.blue + message);
  }
};

node.prototype.on = function(hook, callback){
  if (hook == 'error') {
    this.errorHandler = callback;
  }
  return this.ee.on(hook, callback);
};

node.prototype.off = function(hook, callback){
  if (hook == 'error'){
    this.errorHandler = null;
  }
  return this.ee.off(hook, callback);
};

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
};

node.prototype.error = function(source, e){
  if (!e && source) {
    e = source;
  }

  this.log('error', source, e);
  if (this.errorHandler){
    this.errorHandler.call(source, e);
  } else {
    throw new Error(e);
  }
};

node.prototype.receive = function(that, channel, message){
  try {
    message = JSON.parse(message);
  } catch (e) {
    this.log('error', 'message', JSON.stringify({message: message, error: e}));
  }

  if (message) {
    that.ee.emit(message.hook, message.data);
  }
};

module.exports = node;
