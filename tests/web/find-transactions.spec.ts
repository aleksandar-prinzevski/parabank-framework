import { test, expect } from '@playwright/test';
import { loadRegion } from '../../src/core/config';
import { registerUser } from '../../src/web/registerUser';
import { openSavingsAccount, transferFunds } from '../../src/web/accounts';

const region = loadRegion();

test('find the last transaction by amount', async ({ page }) => {
  test.setTimeout(90_000);
  await registerUser(page, region);
  const newAccountId = await openSavingsAccount(page);
  const fromAccountId = await transferFunds(page, newAccountId, '10');

  await page.getByRole('link', { name: 'Find Transactions' }).click();
  await page.locator('#accountId').selectOption(fromAccountId);
  await page.getByRole('textbox').last().fill('10');
  await page.getByRole('button', { name: 'Find Transactions' }).last().click();

  await expect(page.locator('#transactionTable')).toContainText('10.00');
});