import { test, expect } from '@playwright/test';
import { loadRegion } from '../../src/core/config';
import { registerUser } from '../../src/web/registerUser';

const region = loadRegion();
const c = region.customer;

test('pay a bill to a new payee', async ({ page }) => {
  test.setTimeout(90_000);
  await registerUser(page, region);

  await page.getByRole('link', { name: 'Bill Pay' }).click();

  await page.locator('[name="payee.name"]').fill('Electric Company');
  await page.locator('[name="payee.address.street"]').fill(c.street);
  await page.locator('[name="payee.address.city"]').fill(c.city);
  await page.locator('[name="payee.address.state"]').fill(c.state);
  await page.locator('[name="payee.address.zipCode"]').fill(c.zipCode);
  await page.locator('[name="payee.phoneNumber"]').fill('070555123');
  await page.locator('[name="payee.accountNumber"]').fill('12345');
  await page.locator('[name="verifyAccount"]').fill('12345');
  await page.locator('[name="amount"]').fill('25');
  //await page.pause(); // Used for manual inspection of the page during test execution

  await page.getByRole('button', { name: 'Send Payment' }).click();
  //await page.pause(); // Used for manual inspection of the page during test execution

  await expect(page.getByText('Bill Payment Complete')).toBeVisible();
  await expect(page.getByText('Electric Company')).toBeVisible();
  //await page.pause(); // Used for manual inspection of the page during test execution
});