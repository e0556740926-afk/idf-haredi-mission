import { insights, verifiedAnnualSaving } from '../fixtures/insights';
import type { Insight, MemberId } from '../types';

export async function getInsights(_viewerId: MemberId): Promise<Insight[]> {
  return [...insights].sort((a, b) => b.annualImpactAbs - a.annualImpactAbs);
}

export async function getVerifiedAnnualSaving(_viewerId: MemberId): Promise<number> {
  return verifiedAnnualSaving;
}
