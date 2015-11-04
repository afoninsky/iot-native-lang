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
  // order is important: first items will be parsed earlier
  // (at least using object iteration order - this is not reliable way, need to change in further)
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

var result = lamp.hear('dear lamp on the kitchen, can you enable yourself? plzkthz');
// result.found: 'on'
// result.left: tokens which was'nt parsen on route from 'kitchen' to 'on'
// result.total: all tokens

var result = lamp.hear('kitchen, set light to 200');
// result.command: 'dim', you can parse 200 from 'result.left' (take a look into example)

var result = lamp.hear('hey you, turn on lamp');
// din't find 'kitchen', so result.command will be null

```

## License

Copyright (c) 2015. Licensed under the Apache 2.0 license.
