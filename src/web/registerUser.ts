import { expect, Page } from '@playwright/test';
import { RegionConfig } from '../core/config';

export interface RegisteredUser {
  username: string;
  password: string;
}

export async function registerUser(page: Page, region: RegionConfig): Promise<RegisteredUser> {
  const c = region.customer;
  const username = `${region.code}${Date.now().toString(36)}`;  // Generate a unique username based on the region with max length of 36 characters. 36 characters is system comstraint.
  
  const unique = Date.now().toString();
  const lastName = `${c.lastName}${unique.slice(-6)}`;   // Append a unique suffix to the last name to ensure uniqueness
  const ssn = unique.slice(-9);   // Use the last 9 digits of the unique timestamp as a mock SSN
  const phone = `${c.phone.slice(0, 3)}${unique.slice(-6)}`;   // Use the first 3 digits of the original phone number and append a unique suffix to ensure uniqueness
  
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

  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByText(/account was created/i)).toBeVisible();

  return { username, password: c.password };
}