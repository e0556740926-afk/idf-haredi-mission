import { safeToSpend } from '../fixtures/safeToSpend';
import type { MemberId, SafeToSpend } from '../types';

/** Identical for every viewer, by construction — see docs/07-data-contract.md #5. */
export async function getSafeToSpend(_viewerId: MemberId): Promise<SafeToSpend> {
  return safeToSpend;
}
