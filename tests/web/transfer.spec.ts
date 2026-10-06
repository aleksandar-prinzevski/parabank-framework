import { test, expect } from '@playwright/test';
import { loadRegion } from '../../src/core/config';
import { registerUser } from '../../src/web/registerUser';

const region = loadRegion();

test('transfer funds between own accounts', async ({ page }) => {
  await registerUser(page, region);

  // create a second account
  await page.getByRole('link', { name: 'Open New Account' }).click();
  await page.locator('#type').selectOption('SAVINGS');
  await expect(page.locator('#fromAccountId option').first()).toBeAttached();
  await page.getByRole('button', { name: 'Open New Account' }).click();
  await expect(page.getByText('Account Opened!')).toBeVisible();
  const newAccountId = await page.locator('#newAccountId').innerText();

  await page.pause();

  // transfer from the first account to the new one
  await page.getByRole('link', { name: 'Transfer Funds' }).click();
  await expect(page.locator('#fromAccountId option').nth(1)).toBeAttached();
  const fromAccountId = await page.locator('#fromAccountId option').first().innerText();

  await page.pause();

  await page.locator('#amount').fill('10');
  await page.locator('#fromAccountId').selectOption(fromAccountId);
  await page.locator('#toAccountId').selectOption(newAccountId);
  await page.getByRole('button', { name: 'Transfer' }).click();

  await page.pause();

  await expect(page.getByText('Transfer Complete!')).toBeVisible();
  console.log(`Transferred $10 from ${fromAccountId} to ${newAccountId}`);
});