import { test, expect } from '@playwright/test';
import { loadRegion } from '../../src/core/config';
import { registerUser } from '../../src/web/registerUser';

const region = loadRegion();

test('login with a valid user', async ({ page }) => {
  const user = await registerUser(page, region);
  await page.getByRole('link', { name: 'Log Out' }).click();

  await page.locator('input[name="username"]').fill(user.username);
  await page.locator('input[name="password"]').fill(user.password);
  await page.getByRole('button', { name: 'Log In' }).click();

  await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();
  console.log(await page.locator('#accountTable').innerText());
});