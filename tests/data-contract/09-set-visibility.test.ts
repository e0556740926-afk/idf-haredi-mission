import { describe, expect, it } from 'vitest';
import { getAccounts, getVisibilityLog, setVisibility } from '../../src/data';

describe('setVisibility — docs/05-seed-data.md test #9', () => {
  it('throws when the caller is not the owner', async () => {
    await expect(
      setVisibility('yoav', 'account', 'acc-dana-checking', 'shared'),
    ).rejects.toThrow();
  });

  it('succeeds when the caller owns the account, and writes to the log', async () => {
    const before = await getVisibilityLog('dana');

    await expect(
      setVisibility('dana', 'account', 'acc-dana-checking', 'shared'),
    ).resolves.toBeUndefined();

    const accounts = await getAccounts('yoav');
    const danaChecking = accounts.find((a) => a.id === 'acc-dana-checking');
    expect(danaChecking?.visibility).toBe('shared');
    expect(danaChecking?.balance).not.toBeNull();

    const after = await getVisibilityLog('dana');
    expect(after.length).toBe(before.length + 1);
    expect(after[0]).toMatchObject({ to: 'shared' });
  });
});
