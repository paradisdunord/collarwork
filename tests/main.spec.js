const assert = require('assert');

// Mock browser environment to allow importing main.js
global.window = {
  top: {},
  self: {},
  location: {}
};
global.document = {
  addEventListener: () => {},
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => []
};

const { easeOutBack } = require('../main.js');

// easeOutBack returns:
// 1 + 4 * Math.pow(t - 1, 3) + 3 * Math.pow(t - 1, 2)
// when t = 0: 1 + 4*(-1) + 3*(1) = 1 - 4 + 3 = 0
assert.strictEqual(easeOutBack(0), 0, 'easeOutBack(0) should be 0');

// when t = 1: 1 + 4*(0) + 3*(0) = 1
assert.strictEqual(easeOutBack(1), 1, 'easeOutBack(1) should be 1');

// when t = 0.5: 1 + 4*(-0.125) + 3*(0.25) = 1 - 0.5 + 0.75 = 1.25
assert.strictEqual(easeOutBack(0.5), 1.25, 'easeOutBack(0.5) should be 1.25');

console.log('All tests passed!');
