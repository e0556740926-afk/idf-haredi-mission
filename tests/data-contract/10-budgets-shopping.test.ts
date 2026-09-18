import { describe, expect, it } from 'vitest';
import { getBudgets } from '../../src/data';

describe('getBudgets — docs/05-seed-data.md test #10', () => {
  it("shopping category excludes dana's 390 ₪ Zara purchase for yoav", async () => {
    const budgets = await getBudgets('yoav', '2026-09');
    const shopping = budgets.find((b) => b.key === 'shopping');
    expect(shopping).toBeDefined();
    expect(shopping?.spent).toBe(0);
  });

  it('includes it for dana, who owns the transaction', async () => {
    const budgets = await getBudgets('dana', '2026-09');
    const shopping = budgets.find((b) => b.key === 'shopping');
    expect(shopping?.spent).toBe(390);
  });
});
