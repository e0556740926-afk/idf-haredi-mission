/**
 * The one module screens, hooks, and components are allowed to import data
 * functions from. Nothing here reaches into src/data/fixtures or
 * src/data/supabase directly — everything is chosen here, once, by
 * VITE_DATA_SOURCE (docs/07-data-contract.md).
 *
 * Not every function has a supabase/ implementation yet: goals, rituals,
 * recurring bills, insights, the settlement "mark transferred" mutation,
 * and the Today screen's literal budget-overview/pocket-status helpers
 * depend on tables this migration doesn't create (M3/M4 scope per
 * docs/02-milestones.md, or — for the two "overview" helpers — numbers
 * that were never tied to a real row to begin with). Those always use the
 * mock implementation regardless of VITE_DATA_SOURCE; see REPORT.md
 * "חיבור מסד נתונים" for the exact list and why.
 */
import * as mock from './mock/household';
import * as mockActivity from './mock/activity';
import * as mockAllowance from './mock/allowance';
import * as mockAccounts from './mock/accounts';
import * as mockSafeToSpend from './mock/safeToSpend';
import * as mockCashflow from './mock/cashflow';
import * as mockBudgets from './mock/budgets';
import * as mockSettlement from './mock/settlement';
import * as mockVisibility from './mock/visibilitySettings';

import * as supa from './supabase/household';
import * as supaActivity from './supabase/activity';
import * as supaAllowance from './supabase/allowance';
import * as supaAccounts from './supabase/accounts';
import * as supaSafeToSpend from './supabase/safeToSpend';
import * as supaCashflow from './supabase/cashflow';
import * as supaBudgets from './supabase/budgets';
import * as supaSettlement from './supabase/settlement';
import * as supaVisibility from './supabase/visibilitySettings';

const USE_SUPABASE = import.meta.env.VITE_DATA_SOURCE === 'supabase';

export const getHousehold = USE_SUPABASE ? supa.getHousehold : mock.getHousehold;
export const getMembers = USE_SUPABASE ? supa.getMembers : mock.getMembers;
export const getActivity = USE_SUPABASE ? supaActivity.getActivity : mockActivity.getActivity;
export const getOwnRestrictedActivity = mockActivity.getOwnRestrictedActivity;
export const getAllowanceSummaries = USE_SUPABASE ? supaAllowance.getAllowanceSummaries : mockAllowance.getAllowanceSummaries;
export const getAccounts = USE_SUPABASE ? supaAccounts.getAccounts : mockAccounts.getAccounts;
export const getPrivateAccountsExistence = USE_SUPABASE
  ? supaAccounts.getPrivateAccountsExistence
  : mockAccounts.getPrivateAccountsExistence;
export const getSafeToSpend = USE_SUPABASE ? supaSafeToSpend.getSafeToSpend : mockSafeToSpend.getSafeToSpend;
export const getCashflow = USE_SUPABASE ? supaCashflow.getCashflow : mockCashflow.getCashflow;
export const getBudgets = USE_SUPABASE ? supaBudgets.getBudgets : mockBudgets.getBudgets;
export const getSettlement = USE_SUPABASE ? supaSettlement.getSettlement : mockSettlement.getSettlement;
export const setVisibility = USE_SUPABASE ? supaVisibility.setVisibility : mockVisibility.setVisibility;
export const getVisibilityLog = USE_SUPABASE ? supaVisibility.getVisibilityLog : mockVisibility.getVisibilityLog;

// Not yet backed by a table/RPC in this migration — always mock (see the
// module doc comment above).
export { getPockets } from './mock/pockets';
export { getKnownCashflowItems } from './mock/cashflow';
export { getBudgetsOverview } from './mock/budgets';
export { getRecurring, getRecurringMonthlyTotal } from './mock/recurring';
export { getInsights, getVerifiedAnnualSaving } from './mock/insights';
export { getGoals } from './mock/goals';
export { markSettlementTransferred } from './mock/settlement';
export { getRitual, saveRitualDecision } from './mock/ritual';

export * from './types';
