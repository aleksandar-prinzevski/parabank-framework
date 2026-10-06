import { test, expect } from '@playwright/test';
import { loadRegion } from '../../src/core/config';
import { registerUser } from '../../src/web/registerUser';

const region = loadRegion();

test('lookup login info for a freshly registered user', async ({ page }) => {
  test.setTimeout(90_000);
  const user = await registerUser(page, region);
  await page.getByRole('link', { name: 'Log Out' }).click();

  await page.goto('lookup.htm');
  await page.locator('#firstName').fill(user.firstName);
  await page.locator('#lastName').fill(user.lastName);
  await page.locator('[id="address.street"]').fill(user.street);
  await page.locator('[id="address.city"]').fill(user.city);
  await page.locator('[id="address.state"]').fill(user.state);
  await page.locator('[id="address.zipCode"]').fill(user.zipCode);
  await page.locator('#ssn').fill(user.ssn);
  await page.getByRole('button', { name: 'Find My Login Info' }).click();

  await expect(page.getByText(user.username)).toBeVisible();
  await expect(page.getByText(user.password)).toBeVisible();
});