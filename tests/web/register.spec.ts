import { test, expect } from '@playwright/test';
import { loadRegion } from '../../src/core/config';

const region = loadRegion();
const c = region.customer;

test('register a new user', async ({ page }) => {
  const username = `${region.code}${Date.now().toString(36)}`;

  await page.goto('register.htm');
  await page.locator('[id="customer.firstName"]').fill(c.firstName);
  await page.locator('[id="customer.lastName"]').fill(c.lastName);
  await page.locator('[id="customer.address.street"]').fill(c.street);
  await page.locator('[id="customer.address.city"]').fill(c.city);
  await page.locator('[id="customer.address.state"]').fill(c.state);
  await page.locator('[id="customer.address.zipCode"]').fill(c.zipCode);
  await page.locator('[id="customer.phoneNumber"]').fill(c.phone);
  await page.locator('[id="customer.ssn"]').fill(c.ssn);
  await page.locator('[id="customer.username"]').fill(username);
  await page.locator('[id="customer.password"]').fill(c.password);
  await page.locator('#repeatedPassword').fill(c.password);
  // await page.pause();

  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page.getByText(/account was created/i)).toBeVisible();
});