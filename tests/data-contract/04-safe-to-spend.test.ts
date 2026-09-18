import { describe, expect, it } from 'vitest';
import { getSafeToSpend } from '../../src/data';

describe('getSafeToSpend — docs/07-data-contract.md #5', () => {
  it('is identical for both members and breakdown sums to the total', async () => {
    const dana = await getSafeToSpend('dana');
    const yoav = await getSafeToSpend('yoav');

    expect(dana.amount).toBe(yoav.amount);
    expect(dana.breakdown).toEqual(yoav.breakdown);

    const sum = dana.breakdown.reduce((acc, item) => acc + item.amount, 0);
    expect(sum).toBe(dana.amount);
  });
});
