import { test, expect } from '@playwright/test';

test('register a new user', async ({ page }) => {
 
  await page.goto('register.htm');
  await page.locator('[id="customer.firstName"]').fill('User3');
  await page.locator('[id="customer.lastName"]').fill('test');
  await page.locator('[id="customer.address.street"]').fill('Partizanska');
  await page.locator('[id="customer.address.city"]').fill('Skopje');
  await page.locator('[id="customer.address.state"]').fill('Skopje');
  await page.locator('[id="customer.address.zipCode"]').fill('1000');
  await page.locator('[id="customer.phoneNumber"]').fill('070000111');
  await page.locator('[id="customer.ssn"]').fill('0000000000003');
  await page.pause(); // tactical break to visualize the progress.

  await page.locator('[id="customer.username"]').fill('bpmkuser3');
  await page.locator('[id="customer.password"]').fill('User3test');
  await page.locator('#repeatedPassword').fill('User3test');
  await page.pause(); // tactical break to visualize the progress.

  await page.getByRole('button', { name: 'Register' }).click();
  await page.pause(); // tactical break to visualize the progress.

  await expect(page.getByText(/account was created/i)).toBeVisible();


});