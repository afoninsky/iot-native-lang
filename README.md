# iot-native-lang
robots can hear us

## What is it

Simple module which try to convert native language text into commands. For example, we could say 'turn off the lights' and your power switch can handle it.

## How to Use

```javascript
'use strict';
Lang = require('iot-native-lang');

var lamp = new Lang({
  // default, other available are: 'ru', 'es', 'fa', 'fr', 'it', 'nl', 'no', 'pl', 'pt'
  lang: 'en'
  // will listen this words or similar: lamps, lamp etc
  listen: 'kitchen light lamps',
  // dont return command if this words found
  // example: if command send to bathroom but not kitchen
  ignore: 'bathroom',
  // command to execute
  actions: {
    on: {
      listen: 'enable'
    },
    off: {
      listen: 'disable',
      default: true // return 'off' if none actions found
    },
    dim: {
      listen: 'set increase decrease low high',
      arguments: {
        'middle': 100, // arguments will be passed if token found
        'bright': 255,
        'dimly': 10,
        default: function (tokens, text) { // we can specify method for generate arguments
          // tokens: not parsed tokens
          // text: incoming string
          var set = -1;
          tokens.forEach(function (token) {
            token = parseInt(token, 10);
            if(!isNaN(token)) {
              set = token;
            }
          });
          // we should return array of arguments or 'false'
          return (set >= 0 && set <= 255) ? [set] : false;
        }
      }
    }
  }
});

var result = lamp.hear('dear lamp on the kitchen, can you enable yourself? plzkthz');
// result.command === 'on'

var result = lamp.hear('kitchen, set light to 200');
// result.command === 'dim', result.arguments === [200]


```

## License

Copyright (c) 2015. Licensed under the Apache 2.0 license.
