import { expect, Page } from '@playwright/test';
import { RegionConfig } from '../core/config';

export interface RegisteredUser {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  ssn: string;
}

export async function registerUser(page: Page, region: RegionConfig): Promise<RegisteredUser> {
  const c = region.customer;
  const unique = Date.now().toString();
  const username = `${region.code}${Date.now().toString(36)}`;
  const lastName = `${c.lastName}${unique.slice(-6)}`;
  const ssn = unique.slice(-9);
  const phone = `${c.phone.slice(0, 3)}${unique.slice(-6)}`;

  await page.goto('register.htm');
  await page.locator('[id="customer.firstName"]').fill(c.firstName);
  await page.locator('[id="customer.lastName"]').fill(lastName);
  await page.locator('[id="customer.address.street"]').fill(c.street);
  await page.locator('[id="customer.address.city"]').fill(c.city);
  await page.locator('[id="customer.address.state"]').fill(c.state);
  await page.locator('[id="customer.address.zipCode"]').fill(c.zipCode);
  await page.locator('[id="customer.phoneNumber"]').fill(phone);
  await page.locator('[id="customer.ssn"]').fill(ssn);
  await page.locator('[id="customer.username"]').fill(username);
  await page.locator('[id="customer.password"]').fill(c.password);
  await page.locator('#repeatedPassword').fill(c.password);

  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByText(/account was created/i)).toBeVisible();

  return {
    username,
    password: c.password,
    firstName: c.firstName,
    lastName,
    street: c.street,
    city: c.city,
    state: c.state,
    zipCode: c.zipCode,
    ssn,
  };
}