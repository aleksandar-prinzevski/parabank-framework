import { test, expect } from '@playwright/test';
import { loadRegion } from '../../src/core/config';
import { registerUser } from '../../src/web/registerUser';
import { openSavingsAccount, openTransferForm } from '../../src/web/accounts';

const region = loadRegion();

// Edge case (boundary): transfer the entire available balance.
// After opening the savings account the checking account holds $415.50, so it should end at $0.00.
test('transfer the whole balance', async ({ page }) => {
  test.setTimeout(90_000);
  await registerUser(page, region);
  const savingsId = await openSavingsAccount(page);
  await openTransferForm(page, savingsId);

  await page.locator('#amount').fill('415.50');
  await page.getByRole('button', { name: 'Transfer' }).click();
  await expect(page.getByText('Transfer Complete!')).toBeVisible();

  await page.getByRole('link', { name: 'Accounts Overview' }).click();
  const table = page.locator('#accountTable');
  console.log(await table.innerText());
  await expect(table).toContainText('$0.00');
  await expect(table).toContainText('$515.50');
});

// Idempotency: double-click the Transfer button with $10.
// Known defect: the money moves twice (checking $395.50, savings $120.00).
// Correct behavior: it moves once (checking $405.50, savings $110.00).
test.fail('double-click on Transfer moves the money only once', async ({ page }) => {
  test.setTimeout(90_000);
  await registerUser(page, region);
  const savingsId = await openSavingsAccount(page);
  await openTransferForm(page, savingsId);

  await page.locator('#amount').fill('10');
  await page.getByRole('button', { name: 'Transfer' }).dblclick();

  await page.getByRole('link', { name: 'Accounts Overview' }).click();
  const table = page.locator('#accountTable');
  await expect(table).toContainText('$405.50');
  await expect(table).toContainText('$110.00');
});