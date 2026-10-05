import { test, expect } from '@playwright/test';

test('lookup login info for existing user', async ({ page }) => {
  await page.goto('lookup.htm');

  await page.locator('#firstName').fill('User3');
  await page.locator('#lastName').fill('test');
  await page.locator('[id="address.street"]').fill('Partizanska');
  await page.locator('[id="address.city"]').fill('Skopje');
  await page.locator('[id="address.state"]').fill('Skopje');
  await page.locator('[id="address.zipCode"]').fill('1000');
  await page.locator('#ssn').fill('0000000000003');
    //await page.pause();

  await page.getByRole('button', { name: 'Find My Login Info' }).click();
    //await page.pause();

  await expect(page.getByText('bpmkuser3')).toBeVisible();
  await expect(page.getByText('User3test')).toBeVisible();
});