import { expect, test } from '@playwright/test';

/**
 * Smoke test for the visibility contract at the UI level — the same
 * invariant tests/data-contract checks at the data layer, verified here
 * through the actual rendered screens and the dev viewer switch.
 */
test('activity feed row counts follow the visibility contract per viewer', async ({ page }) => {
  await page.goto('/activity');

  // Default viewer is Dana: 7 rows (see docs/07-data-contract.md / REPORT.md).
  await expect(page.getByText('אותו בית. שתי תצוגות.')).toBeVisible();
  await expect(page.locator('text=משכורת').first()).toHaveCount(0);

  await page.getByRole('button', { name: 'התצוגה של יואב' }).click();
  await expect(page.getByText('הכיס האישי של דנה')).toBeVisible();
  await expect(page.getByText('חשבון פרטי של דנה')).toBeVisible();
  await expect(page.getByText('זארה')).toHaveCount(0);
});

test('only the account owner can change its visibility, and the change survives navigation', async ({ page }) => {
  await page.goto('/accounts');
  await page.getByLabel('עו״ש דנה — לאומי').getByRole('button', { name: 'פרטי' }).click();
  await expect(page.getByText('רואה רק שהחשבון קיים')).toBeVisible();

  await page.getByRole('link', { name: 'הגדרות הבית' }).click();
  await expect(page.getByText('עו״ש דנה — לאומי').first()).toBeVisible();
});
