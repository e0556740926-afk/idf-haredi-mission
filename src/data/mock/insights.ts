import { insights, verifiedAnnualSaving } from '../fixtures/insights';
import type { Insight, MemberId } from '../types';

export async function getInsights(_viewerId: MemberId): Promise<Insight[]> {
  return [...insights].sort((a, b) => Math.abs(b.annualImpact) - Math.abs(a.annualImpact));
}

export async function getVerifiedAnnualSaving(_viewerId: MemberId): Promise<number> {
  return verifiedAnnualSaving;
}
