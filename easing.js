/**
 * Custom Elastic Ease Out Back function
 * @param {number} t - Progress value from 0 to 1
 * @returns {number} - Eased value
 */
const c1 = 3.0; // High overshoot multiplier for a solid bump
const c3 = c1 + 1;

const easeOutBack = (t) => {
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { easeOutBack };
}
