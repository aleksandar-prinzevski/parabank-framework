import { test, expect } from '@playwright/test';
import { loadRegion } from '../../src/core/config';
import { registerUser } from '../../src/web/registerUser';

const region = loadRegion();

test('transfer funds between own accounts', async ({ page }) => {
  test.setTimeout(90_000);
  await registerUser(page, region);

  // create a second account
  await page.getByRole('link', { name: 'Open New Account' }).click();
  await page.locator('#type').selectOption('SAVINGS');
  await expect(page.locator('#fromAccountId option').first()).toBeAttached();
  await page.getByRole('button', { name: 'Open New Account' }).click();
  await expect(page.getByText('Account Opened!')).toBeVisible();
  const newAccountId = await page.locator('#newAccountId').innerText();

  //await page.pause(); // Used for manual inspection of the page during test execution

  // transfer from the first account to the new one
  await page.getByRole('link', { name: 'Transfer Funds' }).click();
  await expect(page.locator('#fromAccountId option').nth(1)).toBeAttached();
  const fromAccountId = await page.locator('#fromAccountId option').first().innerText();

  ///await page.pause(); // Used for manual inspection of the page during test execution

  await page.locator('#amount').fill('10');
  await page.locator('#fromAccountId').selectOption(fromAccountId);
  await page.locator('#toAccountId').selectOption(newAccountId);
  await page.getByRole('button', { name: 'Transfer' }).click();

  //await page.pause(); // Used for manual inspection of the page during test execution

  await expect(page.getByText('Transfer Complete!')).toBeVisible();
  // find the transaction by amount
  await page.getByRole('link', { name: 'Find Transactions' }).click();
  await page.locator('#accountId').selectOption(fromAccountId);
  await page.getByRole('textbox').last().fill('10');
  await page.getByRole('button', { name: 'Find Transactions' }).last().click();

  await expect(page.locator('#transactionTable')).toContainText('10.00');

  console.log(`Transferred $10 from ${fromAccountId} to ${newAccountId}`);
});