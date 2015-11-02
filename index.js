'use strict';

var natural = require('natural');
var _ = require('lodash');

function SpeechParser(_cfg) {

  var cfg = this.cfg = _.defaults(_cfg || {}, {
    lang: 'en',
    listen: '',
    ignore: ''
  });

  var prefix = (function(lang) {
    if(lang === 'en') {
      return '';
    }
    return lang.charAt(0).toUpperCase() + lang.slice(1);
  }(cfg.lang));

  var tokenizer = 'AggressiveTokenizer' + prefix;
  var stem = 'PorterStemmer'+prefix+'';
  if(!natural[tokenizer] || !natural[stem]) {
    throw new Error('language '+cfg.lang+' dont supported');
  }
  this.tokenizer = new natural[tokenizer]();
  this.stem = natural[stem].stem;

  this.listen = this.extractTokens(cfg.listen, 3);
  this.ignore = this.extractTokens(cfg.ignore, 3);
  this.actions = this.parseActions(cfg.actions);

}

// convert passed actions into internal format 'token => command/arguments'
SpeechParser.prototype.parseActions = function (params) {

  var self = this, actions = {};
  var parseArguments = function (arg) {
    var parsed = {};
    _.each(arg, function (item, token) {
      if(token === 'default') {
        token = '';
      }
      token = self.stem(token);
      if(_.isArray(item) || _.isFunction(item)) {
        parsed[token] = item;
      } else {
        parsed[token] = [item];
      }
    });
    return parsed;
  };

  _.each(params, function (rules, command) {

    var arg = parseArguments(rules.arguments);
    var tokens = self.extractTokens(rules.listen, 3);

    _.each(tokens, function (token) {
      actions[token] = actions[token] || {};
      var action = actions[token];
      if(action.command && action.command !== command) {
        throw new Error('"'+token+'" already busy by {'+action.command+'} (bind {'+command+'} failed)');
      }
      action.command = command;
      action.arguments = arg;

    });
    if(rules.default) {
      actions[''] = {
        command: command,
        arguments: arg
      };
    }
  });
  return actions;
};


SpeechParser.prototype.extractTokens = function (text, length) {
  return _.chain(this.tokenizer.tokenize(text))
    .filter(function (item) {
      return item.length >= length;
    })
    .map(this.stem)
    .uniq()
    .value();
};


SpeechParser.prototype.hear = function (text) {
  var tokenFound, actionFound, argumentsFound, unknownTokens = [],
      actions = this.actions,
      listen = this.listen,
      ignore = this.ignore;

  _.each(this.extractTokens(text, 1), function (token) {

    if(_.indexOf(listen, token) !== -1) {
      tokenFound = token; // listen token is found - perhaps we could handle this
      return;
    }
    if(_.indexOf(ignore, token) !== -1) {
      tokenFound = null;  // stop token is found - anyway we couldnt handle this
      return false;       // exit from iteration
    }
    if(actions[token]) {
      actionFound = actions[token]; // command found - perhaps we could handle this
      return;
    }
    unknownTokens.push(token); // this token we dont know - may be arguments or stuff
  });

  if(!actionFound && actions['']) { // default command exists - we can use it
    actionFound = actions[''];
  }

  if(!tokenFound || !actionFound) {
    return false; // command not found, token not found or command in ignored words
  }

  // we have command now, lets iterate over unknown tokens and find possible arguments
  var actionFoundArguments = actionFound.arguments;
  if(actionFoundArguments) {
    _.each(unknownTokens, function (token) {
      if(actionFoundArguments[token]) {
        argumentsFound = actionFoundArguments[token];
        return false;
      }
    });
  }

  // let's check default arguments if none found
  if(!argumentsFound && actionFoundArguments['']) {
    argumentsFound = actionFoundArguments[''];
  }

  // oops, we have a function here - lets execute it sync and gain arguments
  if(typeof argumentsFound === 'function') {
    argumentsFound = argumentsFound(unknownTokens, text);
    // function says we should skip triggering
    if(argumentsFound === false) {
      return false;
    }
  }

  if(typeof argumentsFound === 'undefined') {
    argumentsFound = [];
  } else if (!_.isArray(argumentsFound)) {
    argumentsFound = [argumentsFound];
  }

  return {
    command: actionFound.command,
    arguments: argumentsFound
  };
};

module.exports = SpeechParser;
