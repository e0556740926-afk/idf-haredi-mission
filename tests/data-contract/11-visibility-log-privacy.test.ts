import { describe, expect, it } from 'vitest';
import { getVisibilityLog, setVisibility } from '../../src/data';

describe('getVisibilityLog — docs/03-visibility-tests.md #17 (supplementary)', () => {
  it("shows the partner that a change happened, without revealing the account name", async () => {
    await setVisibility('yoav', 'account', 'acc-yoav-checking', 'private');

    const asOwner = await getVisibilityLog('yoav');
    expect(asOwner[0].entityLabel).toBe('עו״ש יואב — דיסקונט');

    const asPartner = await getVisibilityLog('dana');
    expect(asPartner[0].entityLabel).toBeNull();
    expect(asPartner[0].to).toBe('private');
  });
});
