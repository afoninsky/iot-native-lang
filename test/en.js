'use strict';

var chai = require('chai');
var expect = chai.expect;


describe('en:', function () {

  var Lang = require('../');
  var lamp = new Lang({
    listen: 'kitchen light lamps',
    ignore: 'bathroom',
    actions: {
      on: {
        listen: 'enable'
      },
      off: {
        listen: 'disable',
        default: true
      },
      dim: {
        listen: 'set increase decrease low high',
        arguments: {
          'middle': 100,
          'bright': 255,
          'dimly': 10,
          default: function (tokens) {
            var set = -1;
            tokens.forEach(function (token) {
              token = parseInt(token, 10);
              if(!isNaN(token)) {
                set = token;
              }
            });
            return (set >= 0 && set <= 255) ? [set] : false;
          }
        }
      }
    }
  });

  it('ensure lamp is listening correct channels', function () {
    expect(lamp.listen).to.eql(['kitchen', 'light', 'lamp']);
  });

  it('ensure lamp is ignoring correct channels', function () {
    expect(lamp.ignore).to.eql(['bathroom']);
  });


  it('should on the light', function () {
    var res = lamp.hear('please enable light in the kitchen, thank you');
    expect(res.command).to.equal('on');
    expect(res.arguments).to.eql([]);
  });

  it('should off the light', function () {
    var res = lamp.hear('im tired of kitchen\'s lamp');
    expect(res.command).to.equal('off');
    expect(res.arguments).to.eql([]);
  });

  it('make lamp brighter', function () {
    var res = lamp.hear('kitchen, set the lights to 200');
    expect(res.command).to.equal('dim');
    expect(res.arguments).to.eql([200]);
  });

  it('make lamp normal', function () {
    var res = lamp.hear('kitchen, set the lights to middle');
    expect(res.command).to.equal('dim');
    expect(res.arguments).to.eql([100]);
  });

  it('dont hear', function () {
    var res = lamp.hear('kitchen, set the lights to none');
    expect(res).to.equal(false);
  });

  it('dont hear from other room', function () {
    var res = lamp.hear('bathroom, set the lights to 200');
    expect(res).to.equal(false);
  });

  it('error on same tokens', function () {
    expect(function () { new Lang({
      listen: 'kitchen light lamps',
      ignore: 'bathroom',
      actions: {
        on: {
          listen: 'enable'
        },
        off: {
          listen: 'enable',
        }
      }
    })}).to.throw.error;
  });

});
