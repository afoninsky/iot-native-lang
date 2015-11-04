'use strict';

var UnbalancedTree = function (input, extractor, defaultToken) {

  var parseNode = function (node) {
    var leaf = {};
    if(typeof node !== 'object') {
      return node;
    }
    var iterate = function (item) {
      leaf[item] = parseNode(node[key]);
    };

    for(var key in node) {
      extractor(key).forEach(iterate);
    }
    return leaf;
  };

  this.struct = parseNode(input);
  this.default = defaultToken;
};

UnbalancedTree.prototype.findRoute = function (allowedSteps) {

  var itemsLeft = allowedSteps, defaultToken = this.default;
  var travelTree = function (tree, steps) {
    var found, defaultFound = null;
    if(!steps.length) { return null; } // no luck
    for(var step in tree) {
      var newTree = tree[step];
      if(defaultToken && step === defaultToken) { // if default exists and no luck with key - with use this one
        defaultFound = travelTree(newTree, steps.slice());
      }
      var index = steps.indexOf(step);
      if (index === -1) { // allowed step not found - didnt go here
        continue;
      }
      if(typeof newTree !== 'object') { // string found
        found = newTree;
        steps.splice(index, 1);
        itemsLeft = steps;
        return found;
      }
      var clonnedSteps = steps.slice();
      clonnedSteps.splice(index, 1);
      found = travelTree(newTree, clonnedSteps);
      if(found) { return found; }
    }
    return defaultFound;
  };

  return {
    found: travelTree(this.struct, allowedSteps, true),
    left: itemsLeft
  };
};

module.exports = UnbalancedTree;
