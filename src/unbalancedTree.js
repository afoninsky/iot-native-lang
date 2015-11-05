'use strict';
var _ = require('lodash');

var UnbalancedTree = function (input, extractor, defaultToken) {

  var leafs = {}, targets = [];
  var parseNode = function (node) {
    var leaf = {};
    if(!_.isPlainObject(node)) {
      targets.push(node);
      return targets.length - 1;
      // return node;
    }
    var iterate = function (item) {
      leafs[item] = true;
      leaf[item] = parseNode(node[key]);
    };

    for(var key in node) {
      extractor(key).forEach(iterate);
    }
    return leaf;
  };

  this.struct = parseNode(input);
  this.targets = targets;
  delete leafs[defaultToken];
  this.leafs = Object.keys(leafs);
  this.default = defaultToken;
};


UnbalancedTree.prototype.findRoute = function (allowedSteps) {

  var targets = this.targets;
  var foundItem, passedSteps = [], travel = function (items, steps) {
    if(foundItem) { return; }
    if(typeof items === 'number') {
      foundItem = targets[items];
      passedSteps = steps;
      return;
    }
    for(var _token in items) {
      if(allowedSteps.indexOf(_token) !== -1) {
        var _steps = steps.slice();
        _steps.push(_token);
        travel(items[_token], _steps);
      }
    }
  };
  travel(this.struct, []);

  return {
    found: foundItem,
    route: passedSteps,
    left: _.difference(allowedSteps, passedSteps)
  };
};

module.exports = UnbalancedTree;
