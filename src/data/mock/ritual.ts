import { ritual as ritualFixture } from '../fixtures/ritual';
import type { MemberId, Ritual, RitualDecisionInput } from '../types';

const state: Ritual = structuredClone(ritualFixture);

export async function getRitual(_viewerId: MemberId, _id?: string): Promise<Ritual> {
  return state;
}

export async function saveRitualDecision(
  _viewerId: MemberId,
  input: RitualDecisionInput,
): Promise<void> {
  const decision = state.decisions.find((d) => d.index === input.index);
  if (!decision) throw new Error(`Unknown ritual decision index ${input.index}`);

  if (input.deferred) {
    decision.deferred = true;
    decision.text = null;
    decision.owner = null;
    decision.dueDate = null;
  } else {
    decision.deferred = false;
    decision.text = input.text;
    decision.owner = input.owner;
    decision.dueDate = input.dueDate;
  }
}
