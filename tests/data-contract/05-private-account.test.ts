import { describe, expect, it } from 'vitest';
import { getAccounts, getPrivateAccountsExistence } from '../../src/data';

describe('private account isolation — docs/07-data-contract.md #6', () => {
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

  it("getPrivateAccountsExistence surfaces it with no balance", async () => {
    const existence = await getPrivateAccountsExistence('yoav');
    expect(existence).toEqual([
      { id: 'acc-dana-private', ownerId: 'dana', displayName: 'חשבון מלפני הזוגיות' },
    ]);
  });
});
