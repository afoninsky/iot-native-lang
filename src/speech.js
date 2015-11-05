'use strict';

var natural = require('natural');
var _ = require('lodash');
var Tree = require('./unbalancedTree');

function Speech(_cfg) {

  var cfg = this.cfg = _.defaults(_cfg || {}, {
    lang: 'en',
    minTokenLength: 3
  });

  var prefix = (cfg.lang === 'en') ? '' : cfg.lang.charAt(0).toUpperCase() + cfg.lang.slice(1),
      tokenizer = 'AggressiveTokenizer' + prefix,
      stem = 'PorterStemmer' + prefix;

  if(!natural[tokenizer] || !natural[stem]) {
    throw new Error('language '+cfg.lang+' not supported');
  }

  this.defaultToken = 'default';
  this.tokenizer = new natural[tokenizer]();
  this.stem = natural[stem].stem;
  if(cfg.listen) {
    this.tree = new Tree(cfg.listen, function (text) {
      return this.extractTokens(text, cfg.minTokenLength);
    }.bind(this), this.defaultToken);
  }
}

Speech.prototype.extractTokens = function (text, length) {
  return _.chain(this.tokenizer.tokenize(text))
    .filter(function (item) {
      return item.length >= length;
    })
    .map(this.stem)
    .uniq()
    .value();
};

Speech.prototype.removeDefault = function (arr) {
  var index = arr.indexOf(this.defaultToken);
  if(index !== -1) {
    arr.splice(index, 1);
  }
};

Speech.prototype.hear = function (text) {
  var tokens = this.extractTokens(text, 1);
  tokens.push(this.defaultToken);
  var result = this.tree.findRoute(tokens);
  result.total = tokens;
  this.removeDefault(result.left);
  this.removeDefault(result.total);
  return result;
};

module.exports = Speech;
