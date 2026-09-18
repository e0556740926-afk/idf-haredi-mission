export type Visibility = 'shared' | 'summary_only' | 'private';
export type MemberId = string;

export type Archetype = 'one_pot' | 'three_pots' | 'separate' | 'asymmetric';

export interface Household {
  id: string;
  name: string;
  marketCode: string;
  baseCurrency: string;
  timezone: string;
  archetype: Archetype;
  fairnessRule: { type: 'none' | 'half' | 'income' | 'per_category' };
  safetyBuffer: number;
  quietModeEnabled: boolean;
}

export interface Member {
  id: MemberId;
  displayName: string;
  initial: string;
  allowanceMonthly: number;
  incomeMonthly: number | null;
  incomeDay: number | null;
}

export interface ActivityRow {
  id: string;
  bookedAt: string; // YYYY-MM-DD
  description: string;
  merchantName: string | null;
  categoryKey: string;
  categoryLabel: string;
  amount: number; // negative = expense
  currency: string;
  ownerId: MemberId | null; // null = household
  visibility: Visibility;
  isSurprise: boolean;
  surpriseUntil: string | null;
  /** What the partner sees of this row. Only meaningful to the owner. */
  partnerSees: 'all' | 'amount_only' | 'nothing';
}

export interface AllowanceSummary {
  ownerId: MemberId;
  ownerName: string;
  period: string; // YYYY-MM
  total: number;
  count: number;
  // Deliberately no merchantName, no categoryKey, no exact dates.
}

export interface SafeToSpendBreakdownItem {
  key: string;
  label: string;
  amount: number;
}

export interface SafeToSpend {
  amount: number;
  currency: string;
  breakdown: SafeToSpendBreakdownItem[];
  daysLeft: number;
}

export type AccountKind = 'checking' | 'savings' | 'credit_card' | 'loan' | 'manual';
export type SyncState = 'ok' | 'stale' | 'broken' | 'manual';

export interface AccountRow {
  id: string;
  displayName: string;
  maskedNumber: string | null;
  kind: AccountKind;
  ownerId: MemberId | null;
  visibility: Visibility;
  balance: number | null; // null when the viewer may not see the balance
  currency: string;
  statementDay: number | null;
  /** Positive amount due at the next statement (credit cards only). */
  statementAmountDue: number | null;
  syncState: SyncState;
  lastSyncedAt: string | null;
}

export interface PrivateAccountExistence {
  id: string;
  ownerId: MemberId;
  displayName: string;
}

export interface Settlement {
  periodLabel: string;
  ruleLabel: string;
  splitLabel: string;
  householdTotal: number;
  perMember: { memberId: MemberId; name: string; paid: number; share: number }[];
  fromMemberId: MemberId;
  toMemberId: MemberId;
  amount: number;
  isTransferred: boolean;
}

export interface CashflowPoint {
  date: string;
  expected: number;
  low: number;
  high: number;
}

export interface CashflowCliff {
  date: string;
  label: string;
  shortfall: number;
}

export interface CashflowResult {
  points: CashflowPoint[];
  cliffs: CashflowCliff[];
  floor: number;
}

export interface KnownCashflowItem {
  key: string;
  label: string;
  dateLabel: string;
  amount: number;
  kind: 'income' | 'expense';
}

export interface BudgetEnvelope {
  key: string;
  label: string;
  spent: number;
  limit: number;
  percent: number;
  isOverBudget: boolean;
  overBy: number;
}

export interface RecurringSeries {
  id: string;
  label: string;
  amount: number;
  dayOfMonth: number;
  priceHistory: { date: string; amount: number }[];
}

export type InsightImpact = 'high' | 'medium' | 'low';

export interface Insight {
  id: string;
  title: string;
  detail: string;
  /** Always positive — pair with annualImpactDirection to know saving vs. cost. */
  annualImpactAbs: number;
  annualImpactDirection: 'saving' | 'cost';
  impact: InsightImpact;
  isVerified: boolean;
}

export interface Goal {
  id: string;
  label: string;
  targetAmount: number;
  currentAmount: number;
  percentComplete: number;
  targetDateLabel: string;
  visibility: Visibility;
}

export interface RitualDecisionInput {
  index: number;
  text: string;
  owner: string;
  dueDate: string;
  deferred: boolean;
}

export interface RitualDecision {
  index: number;
  question: string;
  visibility: Visibility;
  text: string | null;
  owner: string | null;
  dueDate: string | null;
  deferred: boolean;
  autoCheckedDone: boolean | null;
}

export interface RitualFollowUp {
  label: string;
  done: boolean;
}

export interface Ritual {
  id: string;
  periodLabel: string;
  followUps: RitualFollowUp[];
  decisions: RitualDecision[];
  winTitle: string;
  winAmount: number;
  streakMonths: number;
}

export interface VisibilityLogEntry {
  id: string;
  entityType: 'account' | 'transaction';
  /** Only shown when the viewer owns the entity — see docs/03-visibility-tests.md #17. */
  entityLabel: string | null;
  changedByName: string;
  from: Visibility;
  to: Visibility;
  at: string;
}

export type VisibilityEntityType = 'account' | 'transaction';

export interface PocketStatus {
  memberId: MemberId;
  name: string;
  allowance: number;
  used: number;
  usedCount: number;
  remaining: number;
  percentUsed: number;
}
