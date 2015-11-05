'use strict';

var chai = require('chai');
var expect = chai.expect;


describe('en:', function () {

  var Lang = require('../');

  var lamp = new Lang({
    listen: {
      'kitchen': {
        'light lamps': {
          'enable': 'on',
          'set increase decrease low high': 'dim',
          'disable default': 'off'
        }
      }
    }
  });

  it('nothing found', function () {
    var res = lamp.hear('hey you, turn on lamp');
    expect(res.found).to.equal(undefined);
  });

  it('should on the light', function () {
    var res = lamp.hear('please enable light in the kitchen, thank you');
    expect(res.found).to.equal('on');
    expect(res.route).to.eql([ 'kitchen', 'light', 'enabl' ]);
    expect(res.left).to.eql([ 'pleas', 'in', 'the', 'thank', 'you' ]);
    expect(res.total).to.eql([ 'pleas', 'enabl', 'light', 'in', 'the', 'kitchen', 'thank', 'you' ]);
  });

  it('should off the light (default)', function () {
    var res = lamp.hear('im tired of kitchen\'s lamp');
    expect(res.found).to.equal('off');
  });

  it('should not off the light (default not found)', function () {
    var test = new Lang({
      listen: {
        'kitchen': {
          'light lamps': {
            'enable': 'on',
            'set increase decrease low high': 'dim',
            'disable': 'off'
          }
        }
      }
    });
    var res = test.hear('im tired of kitchen\'s lamp');
    expect(res.found).to.equal(undefined);
  });

  it('make lamp brighter', function () {
    var res = lamp.hear('kitchen, set the lights to 200');
    expect(res.found).to.equal('dim');
    expect(res.left).to.eql([ 'the', 'to', '200' ]);
  });

});
