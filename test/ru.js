'use strict';

var chai = require('chai');
var expect = chai.expect;


describe('ru:', function () {

  var Lang = require('../');
  var lamp = new Lang({
    lang: 'ru',
    listen: 'кухня люстра свет лампа',
    ignore: 'коридор детская спальня',
    actions: {
      on: {
        listen: 'включить',
      },
      off: {
        listen: 'выключить отключить убрать',
        default: true
      },
      dim: {
        listen: 'уменьшить увеличить убавить прибавить сделать установить',
        arguments: {
          'ярко': 255,
          'средне': 100,
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

  it('should on the light', function () {
    var res = lamp.hear('включи свет на кухне');
    expect(res.command).to.equal('on');
    expect(res.arguments).to.eql([]);
  });

  it('should off the light', function () {
    var res = lamp.hear('выключи весь свет');
    expect(res.command).to.equal('off');
    expect(res.arguments).to.eql([]);
  });

  it('make lamp brighter', function () {
    var res = lamp.hear('установи яркость лампы на 200');
    expect(res.command).to.equal('dim');
    expect(res.arguments).to.eql([200]);
  });

  it('dont hear', function () {
    var res = lamp.hear('установи яркость ламы на _неразборчиво_');
    expect(res).to.equal(false);
  });

});
