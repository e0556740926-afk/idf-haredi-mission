import { settlement as settlementFixture } from '../fixtures/settlement';
import type { MemberId, Settlement } from '../types';

let state: Settlement = { ...settlementFixture };

export async function getSettlement(_viewerId: MemberId, _period: string): Promise<Settlement> {
  return state;
}

export async function markSettlementTransferred(
  _viewerId: MemberId,
  transferred: boolean,
): Promise<Settlement> {
  state = { ...state, isTransferred: transferred };
  return state;
}
