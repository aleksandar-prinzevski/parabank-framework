import { test, expect } from '@playwright/test';
import { loadRegion } from '../../src/core/config';
import { registerUser } from '../../src/web/registerUser';

const region = loadRegion();

test('open a new savings account', async ({ page }) => {
  await registerUser(page, region);

  await page.getByRole('link', { name: 'Open New Account' }).click();
  await page.locator('#type').selectOption('SAVINGS');
   await page.pause();

  // wait until the funding-account dropdown is filled
  await expect(page.locator('#fromAccountId option').first()).toBeAttached();

  await page.getByRole('button', { name: 'Open New Account' }).click();

  await expect(page.getByText('Account Opened!')).toBeVisible();
  const newAccountId = await page.locator('#newAccountId').innerText();
  console.log('New account:', newAccountId);
});