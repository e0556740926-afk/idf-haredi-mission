/**
 * The one module screens, hooks, and components are allowed to import data
 * functions from. Nothing here reaches into src/data/fixtures directly —
 * everything goes through src/data/mock (soon: src/data/supabase, chosen by
 * an env var, with this file's exports unchanged). See
 * docs/07-data-contract.md.
 */
export { getHousehold, getMembers } from './mock/household';
export { getActivity, getOwnRestrictedActivity } from './mock/activity';
export { getAllowanceSummaries } from './mock/allowance';
export { getAccounts, getPrivateAccountsExistence } from './mock/accounts';
export { getSafeToSpend } from './mock/safeToSpend';
export { getCashflow, getKnownCashflowItems } from './mock/cashflow';
export { getBudgets } from './mock/budgets';
export { getRecurring } from './mock/recurring';
export { getInsights, getVerifiedAnnualSaving } from './mock/insights';
export { getGoals } from './mock/goals';
export { getSettlement, markSettlementTransferred } from './mock/settlement';
export { getRitual, saveRitualDecision } from './mock/ritual';
export { setVisibility, getVisibilityLog } from './mock/visibilitySettings';

export * from './types';
