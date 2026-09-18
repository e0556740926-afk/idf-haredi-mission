import { describe, expect, it } from 'vitest';
import { getSafeToSpend } from '../../src/data';

describe('getSafeToSpend — docs/05-seed-data.md test #7', () => {
  it('is identical for both members and breakdown sums to the total', async () => {
    const dana = await getSafeToSpend('dana');
    const yoav = await getSafeToSpend('yoav');

    expect(dana.amount).toBe(yoav.amount);
    expect(dana.breakdown).toEqual(yoav.breakdown);

    const sum = dana.breakdown.reduce((acc, item) => acc + item.amount, 0);
    expect(sum).toBe(dana.amount);
  });

  it('the allowance_remaining component is exactly 1,870 (1,210 + 660)', async () => {
    const { breakdown } = await getSafeToSpend('dana');
    const pockets = breakdown.find((item) => item.key === 'pockets');
    expect(pockets).toBeDefined();
    expect(Math.abs(pockets!.amount)).toBe(1870);
  });
});
