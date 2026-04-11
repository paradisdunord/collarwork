// Mock necessary browser globals for main.js to initialize correctly in Node environment
global.window = { top: {}, self: {} };
window.top = window;
window.self = window;
global.document = {
  addEventListener: () => {} // Mock DOMContentLoaded listener setup
};

const assert = require('node:assert');
const { test, describe, it } = require('node:test');
const { easeOutBack } = require('../main.js');

describe('easeOutBack functionality', () => {
  it('should be a function', () => {
    assert.strictEqual(typeof easeOutBack, 'function');
  });

  it('should return 0 when t = 0', () => {
    assert.strictEqual(easeOutBack(0), 0);
  });

  it('should return 1 when t = 1', () => {
    assert.strictEqual(easeOutBack(1), 1);
  });

  it('should calculate intermediate values correctly (e.g., t = 0.5)', () => {
    // Formula: 1 + c3 * (t - 1)^3 + c1 * (t - 1)^2
    // t = 0.5: 1 + 4 * (-0.5)^3 + 3 * (-0.5)^2
    // = 1 + 4 * (-0.125) + 3 * (0.25)
    // = 1 - 0.5 + 0.75 = 1.25
    assert.strictEqual(easeOutBack(0.5), 1.25);
  });

  it('should calculate correctly for out-of-bounds values', () => {
    // t = -1
    // 1 + 4 * (-2)^3 + 3 * (-2)^2 = 1 - 32 + 12 = -19
    assert.strictEqual(easeOutBack(-1), -19);

    // t = 2
    // 1 + 4 * (1)^3 + 3 * (1)^2 = 1 + 4 + 3 = 8
    assert.strictEqual(easeOutBack(2), 8);
  });
});
