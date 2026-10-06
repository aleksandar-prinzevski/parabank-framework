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

// Known defect: ParaBank completes the negative transfer. The correct behavior is a refusal.
test.fail('rejects a negative transfer amount', async ({ page }) => {
  test.setTimeout(90_000);
  await registerUser(page, region);
  const savingsId = await openSavingsAccount(page);
  await openTransferForm(page, savingsId);

  await page.locator('#amount').fill('-10');
  await page.getByRole('button', { name: 'Transfer' }).click();

  await expect(page.getByRole('heading', { name: 'Error!' })).toBeVisible();
});