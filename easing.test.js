const { easeOutBack } = require('./easing');

describe('easeOutBack', () => {
  test('should return 0 when t is 0', () => {
    expect(easeOutBack(0)).toBeCloseTo(0);
  });

  test('should return 1 when t is 1', () => {
    expect(easeOutBack(1)).toBeCloseTo(1);
  });

  test('should overshoot 1 during the animation', () => {
    // easeOutBack typically overshoots 1 before settling back to 1
    // At t=0.5:
    // c1 = 3, c3 = 4
    // t-1 = -0.5
    // 1 + 4 * (-0.5)^3 + 3 * (-0.5)^2
    // 1 + 4 * (-0.125) + 3 * (0.25)
    // 1 - 0.5 + 0.75 = 1.25
    expect(easeOutBack(0.5)).toBeCloseTo(1.25);
  });

  test('should follow the expected curve', () => {
    // t=0.2
    // t-1 = -0.8
    // 1 + 4 * (-0.8)^3 + 3 * (-0.8)^2
    // 1 + 4 * (-0.512) + 3 * (0.64)
    // 1 - 2.048 + 1.92 = 0.872
    expect(easeOutBack(0.2)).toBeCloseTo(0.872);

    // t=0.8
    // t-1 = -0.2
    // 1 + 4 * (-0.2)^3 + 3 * (-0.2)^2
    // 1 + 4 * (-0.008) + 3 * (0.04)
    // 1 - 0.032 + 0.12 = 1.088
    expect(easeOutBack(0.8)).toBeCloseTo(1.088);
  });
});
