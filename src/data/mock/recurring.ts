import { recurringSeries } from '../fixtures/recurring';
import type { MemberId, RecurringSeries } from '../types';

/** All recurring series are on shared household accounts today. */
export async function getRecurring(_viewerId: MemberId): Promise<RecurringSeries[]> {
  return recurringSeries;
}
