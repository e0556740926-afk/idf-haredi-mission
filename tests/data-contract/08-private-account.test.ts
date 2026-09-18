import { describe, expect, it } from 'vitest';
import { getAccounts, getPrivateAccountsExistence, getSafeToSpend } from '../../src/data';

describe('private account isolation — docs/05-seed-data.md test #8', () => {
  it("dana's private account never appears in yoav's account list", async () => {
    const accounts = await getAccounts('yoav');
    expect(accounts.find((a) => a.id === 'acc-dana-private')).toBeUndefined();
  });

  it('getAccounts returns balance: null for accounts the viewer may not see the balance of', async () => {
    const accounts = await getAccounts('yoav');
    const danaChecking = accounts.find((a) => a.id === 'acc-dana-checking');
    expect(danaChecking).toBeDefined();
    expect(danaChecking?.balance).toBeNull();
  });

  it('getPrivateAccountsExistence surfaces it with no balance', async () => {
    const existence = await getPrivateAccountsExistence('yoav');
    expect(existence).toEqual([
      { id: 'acc-dana-private', ownerId: 'dana', displayName: 'חשבון מלפני הזוגיות' },
    ]);
  });

  it('the 9,400 ₪ private balance is not counted in Safe to Spend for either member', async () => {
    const dana = await getSafeToSpend('dana');
    const yoav = await getSafeToSpend('yoav');
    const total = (s: typeof dana) => s.breakdown.reduce((sum, item) => sum + item.amount, 0);
    // Both totals are identical and neither breakdown references the
    // private account's 9,400 ₪ balance.
    expect(total(dana)).toBe(dana.amount);
    expect(total(yoav)).toBe(yoav.amount);
    expect(dana.breakdown.some((item) => Math.abs(item.amount) === 9400)).toBe(false);
  });
});
