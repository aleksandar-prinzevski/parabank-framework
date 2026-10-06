import { expect, test } from '@playwright/test';
import { loadRegion } from '../../src/core/config';
import { registerUser } from '../../src/web/registerUser';
import { openSavingsAccount, openTransferForm } from '../../src/web/accounts';

const region = loadRegion();

// Negative scenario: transfer far more than the available balance ($10,000 from $415.50).
// Known defect: ParaBank completes the transfer. The correct behavior is a refusal.
test.fail('rejects a transfer above the available balance', async ({ page }) => {
  test.setTimeout(90_000);
  await registerUser(page, region);
  const savingsId = await openSavingsAccount(page);
  await openTransferForm(page, savingsId);

  await page.locator('#amount').fill('10000');
  await page.getByRole('button', { name: 'Transfer' }).click();

  await expect(page.getByRole('heading', { name: 'Error!' })).toBeVisible();
});

// Known defect: ParaBank accepts a negative amount and moves money backwards
// (checking $425.50, savings $90.00). Correct behavior: refuse it and leave balances at $415.50 / $100.00.
test.fail('rejects a negative transfer amount', async ({ page }) => {
  test.setTimeout(90_000);
  await registerUser(page, region);
  const savingsId = await openSavingsAccount(page);
  await openTransferForm(page, savingsId);

  await page.locator('#amount').fill('-10');
  await page.getByRole('button', { name: 'Transfer' }).click();

  await page.getByRole('link', { name: 'Accounts Overview' }).click();
  const table = page.locator('#accountTable');
  await expect(table).toContainText('$415.50');
  await expect(table).toContainText('$100.00');
});