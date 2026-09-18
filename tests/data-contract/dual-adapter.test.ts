/**
 * D5 — the same ten rule-based tests from docs/05-seed-data.md, run once
 * per adapter (mock, supabase), in this one file, in a loop. This is the
 * central safety net for the database-connection stage: if the SQL layer
 * and the mock ever disagree, this is where it shows up.
 *
 * The supabase half needs `npx supabase start` (see supabaseAvailability.ts)
 * — it SKIPS with a clear reason when unreachable rather than reporting a
 * false pass. See REPORT.md "חיבור מסד נתונים" §1 for this sandbox's actual
 * D3 gate result (it could not run `supabase start` at all — Docker
 * registry access is blocked here).
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { isSupabaseReachable } from './supabaseAvailability';
import * as mockAdapter from '../../src/data/mock/activity';
import * as mockAllowance from '../../src/data/mock/allowance';
import * as mockAccounts from '../../src/data/mock/accounts';
import * as mockSafeToSpend from '../../src/data/mock/safeToSpend';
import * as mockBudgets from '../../src/data/mock/budgets';
import * as mockVisibility from '../../src/data/mock/visibilitySettings';

import * as supaAdapter from '../../src/data/supabase/activity';
import * as supaAllowance from '../../src/data/supabase/allowance';
import * as supaAccounts from '../../src/data/supabase/accounts';
import * as supaSafeToSpend from '../../src/data/supabase/safeToSpend';
import * as supaBudgets from '../../src/data/supabase/budgets';
import * as supaVisibility from '../../src/data/supabase/visibilitySettings';
import { signInAsDevMember } from '../../src/data/supabase/auth';

interface Adapter {
  name: 'mock' | 'supabase';
  getActivity: typeof mockAdapter.getActivity;
  getAllowanceSummaries: typeof mockAllowance.getAllowanceSummaries;
  getAccounts: typeof mockAccounts.getAccounts;
  getPrivateAccountsExistence: typeof mockAccounts.getPrivateAccountsExistence;
  getSafeToSpend: typeof mockSafeToSpend.getSafeToSpend;
  getBudgets: typeof mockBudgets.getBudgets;
  setVisibility: typeof mockVisibility.setVisibility;
  /** supabase's RLS keys off the real session, not this argument — sign in first. */
  actAs: (viewerId: 'dana' | 'yoav') => Promise<void>;
}

const mock: Adapter = {
  name: 'mock',
  getActivity: mockAdapter.getActivity,
  getAllowanceSummaries: mockAllowance.getAllowanceSummaries,
  getAccounts: mockAccounts.getAccounts,
  getPrivateAccountsExistence: mockAccounts.getPrivateAccountsExistence,
  getSafeToSpend: mockSafeToSpend.getSafeToSpend,
  getBudgets: mockBudgets.getBudgets,
  setVisibility: mockVisibility.setVisibility,
  actAs: async () => {},
};

const supa: Adapter = {
  name: 'supabase',
  getActivity: supaAdapter.getActivity,
  getAllowanceSummaries: supaAllowance.getAllowanceSummaries,
  getAccounts: supaAccounts.getAccounts,
  getPrivateAccountsExistence: supaAccounts.getPrivateAccountsExistence,
  getSafeToSpend: supaSafeToSpend.getSafeToSpend,
  getBudgets: supaBudgets.getBudgets,
  setVisibility: supaVisibility.setVisibility,
  actAs: signInAsDevMember,
};

let supabaseAvailable = false;
beforeAll(async () => {
  supabaseAvailable = await isSupabaseReachable();
  if (!supabaseAvailable) {
    // eslint-disable-next-line no-console
    console.warn(
      '[dual-adapter] No local Supabase instance reachable — skipping the supabase half. ' +
        'Run `npx supabase start` to exercise it for real.',
    );
  }
});

const ADAPTERS = [mock, supa];

for (const adapter of ADAPTERS) {
  describe.runIf(adapter.name === 'mock' || supabaseAvailable)(`data contract — ${adapter.name}`, () => {
    it("#1 getActivity(yoav): zero rows owned by dana that aren't shared", async () => {
      await adapter.actAs('yoav');
      const rows = await adapter.getActivity('yoav');
      expect(rows.some((r) => r.ownerId === 'dana' && r.visibility !== 'shared')).toBe(false);
    });

    it("#2 getActivity(dana): zero rows owned by yoav that aren't shared", async () => {
      await adapter.actAs('dana');
      const rows = await adapter.getActivity('dana');
      expect(rows.some((r) => r.ownerId === 'yoav' && r.visibility !== 'shared')).toBe(false);
    });

    it('#3 every row satisfies visibility=shared || ownerId=viewer', async () => {
      for (const viewer of ['dana', 'yoav'] as const) {
        await adapter.actAs(viewer);
        const rows = await adapter.getActivity(viewer);
        expect(rows.length).toBeGreaterThan(0);
        for (const row of rows) {
          expect(row.visibility === 'shared' || row.ownerId === viewer).toBe(true);
        }
      }
    });

    it('#4 getAllowanceSummaries(yoav): dana, total 1290, count 5, no forbidden columns', async () => {
      await adapter.actAs('yoav');
      const [summary] = await adapter.getAllowanceSummaries('yoav', '2026-09');
      expect(summary).toMatchObject({ ownerId: 'dana', total: 1290, count: 5 });
      expect(Object.keys(summary)).not.toContain('merchantName');
      expect(Object.keys(summary)).not.toContain('categoryKey');
    });

    it('#6 the surprise gift is absent from getActivity(yoav) but counted in the total', async () => {
      await adapter.actAs('yoav');
      const rows = await adapter.getActivity('yoav');
      expect(rows.find((r) => r.description === 'מתנת יום הולדת ליואב')).toBeUndefined();
      const [summary] = await adapter.getAllowanceSummaries('yoav', '2026-09');
      expect(summary.total).toBe(1290);
    });

    it('#7 getSafeToSpend: identical for both, allowance_remaining = 1,870', async () => {
      await adapter.actAs('dana');
      const dana = await adapter.getSafeToSpend('dana');
      await adapter.actAs('yoav');
      const yoav = await adapter.getSafeToSpend('yoav');
      expect(dana.amount).toBe(yoav.amount);
      const pockets = dana.breakdown.find((b) => b.key === 'pockets');
      expect(Math.abs(pockets!.amount)).toBe(1870);
    });

    it("#8 dana's private account: hidden from yoav's accounts, existence-only, no balance", async () => {
      await adapter.actAs('yoav');
      const accounts = await adapter.getAccounts('yoav');
      expect(accounts.find((a) => a.displayName === 'חשבון מלפני הזוגיות')).toBeUndefined();
      const existence = await adapter.getPrivateAccountsExistence('yoav');
      const privateAccount = existence.find((a) => a.displayName === 'חשבון מלפני הזוגיות');
      expect(privateAccount).toBeDefined();
      expect(privateAccount).not.toHaveProperty('balance');
    });

    it('#9 setVisibility: fails for the non-owner', async () => {
      await adapter.actAs('yoav');
      const accounts = await adapter.getAccounts('yoav');
      const danaAccount = accounts.find((a) => a.displayName.includes('דנה'));
      expect(danaAccount).toBeDefined();
      await expect(adapter.setVisibility('yoav', 'account', danaAccount!.id, 'shared')).rejects.toThrow();
    });

    it("#10 getBudgets(yoav): shopping excludes dana's 390 ₪", async () => {
      await adapter.actAs('yoav');
      const budgets = await adapter.getBudgets('yoav', '2026-09');
      const shopping = budgets.find((b) => b.key === 'shopping');
      expect(shopping?.spent ?? 0).toBe(0);
    });
  });
}
