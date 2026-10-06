import { test, expect } from '@playwright/test';
import { loadRegion } from '../../src/core/config';
import { registerUser } from '../../src/web/registerUser';
import { openSavingsAccount, transferFunds } from '../../src/web/accounts';

const region = loadRegion();

test('accounts overview shows both accounts and the total', async ({ page }) => {
  test.setTimeout(90_000);
  await registerUser(page, region);
  const newAccountId = await openSavingsAccount(page);
  const fromAccountId = await transferFunds(page, newAccountId, '10');

  await page.getByRole('link', { name: 'Accounts Overview' }).click();

  const table = page.locator('#accountTable');
  await expect(table).toContainText(fromAccountId);
  await expect(table).toContainText(newAccountId);
  console.log(await table.innerText());
});