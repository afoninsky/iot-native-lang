/*
  example with lights
 */
'use strict';
var Speech = require('./');
var _ = require('lodash');

// set default lang rules for each device in russian
var defaultLangSet = {
  'свет освещение яркость люстра лампочка лампа': {
    'включить': 'on',
    'выключить отключить': 'off',
    'уменьшить убавить меньше понизить темнее меньше': '_decrease',
    'увеличить прибавить ярче светлее больше': '_increase',
    'сделать установить': '_set',
    'переключить default': 'switch'
  }
};

// create device: it can be off, on, switched (on<->off) and dimmed (from 0 to 255)
var Device = function (name) {
  this.name = name;
  this.current = 100;
  this.min = 0;
  this.max = 255;
  this.step = 50;

  var listen = {};
  listen[this.name] = defaultLangSet;
  this.lang = new Speech({
    lang: 'ru',
    listen: listen
  });

};

// this metod will translate text into command and execute it
Device.prototype.hear = function (text) {
  var result = this.lang.hear(text);
  if(result.found) {
    this[result.found](result);
  }
};

Device.prototype._decrease = function () {
  this.current = _.max([this.min, this.current - this.step]);
  this.dim(this.current);
};

Device.prototype._increase = function () {
  this.current = _.min([this.max, this.current + this.step]);
  this.dim(this.current);
};

Device.prototype._set = function (result) {
  var set = -1;
  result.left.forEach(function (token) {
    token = parseInt(token, 10);
    if(!isNaN(token)) {
      set = token;
    }
  });
  return (set >= this.min && set <= this.max) ? set : false;
};


Device.prototype.on = function () {
  console.log('[%s] включаю свет', this.name);
};

Device.prototype.off = function () {
  console.log('[%s] выключаю свет', this.name);
};

Device.prototype.switch = function () {
  console.log('[%s] переключаю свет', this.name);
};

Device.prototype.dim = function (value) {
  console.log('[%s] устанавливаю свет на', this.name, value);
};


// create devices in different places of flat
var devices = ['коридор', 'кухня', 'детская', 'спальня комната'].map(function (item) {
  return new Device(item);
});

// tell every device what we want
devices.forEach(function (device) {
  device.hear('свет ярче на кухне');
  device.hear('коридор, свет');
  device.hear('выключи свет в спальне и детской');
});
