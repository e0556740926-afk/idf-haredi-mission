import { describe, expect, it } from 'vitest';
import { getAccounts, setVisibility } from '../../src/data';

describe('setVisibility — docs/07-data-contract.md #7', () => {
  it('throws when the caller is not the owner', async () => {
    await expect(
      setVisibility('yoav', 'account', 'acc-dana-checking', 'shared'),
    ).rejects.toThrow();
  });

  it('succeeds when the caller owns the account', async () => {
    await expect(
      setVisibility('dana', 'account', 'acc-dana-checking', 'shared'),
    ).resolves.toBeUndefined();

    const accounts = await getAccounts('yoav');
    const danaChecking = accounts.find((a) => a.id === 'acc-dana-checking');
    expect(danaChecking?.visibility).toBe('shared');
    expect(danaChecking?.balance).not.toBeNull();
  });
});
