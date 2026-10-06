import { expect, Page } from '@playwright/test';

export async function openSavingsAccount(page: Page): Promise<string> {
  await page.getByRole('link', { name: 'Open New Account' }).click();
  await page.locator('#type').selectOption('SAVINGS');
  await expect(page.locator('#fromAccountId option').first()).toBeAttached();
  await page.getByRole('button', { name: 'Open New Account' }).click();
  await expect(page.getByText('Account Opened!')).toBeVisible();
  return page.locator('#newAccountId').innerText();
}

export async function transferFunds(page: Page, toAccountId: string, amount: string): Promise<string> {
  await page.getByRole('link', { name: 'Transfer Funds' }).click();
  await expect(page.locator('#fromAccountId option').nth(1)).toBeAttached();
  const fromAccountId = await page.locator('#fromAccountId option').first().innerText();

  await page.locator('#amount').fill(amount);
  await page.locator('#fromAccountId').selectOption(fromAccountId);
  await page.locator('#toAccountId').selectOption(toAccountId);
  await page.getByRole('button', { name: 'Transfer' }).click();
  await expect(page.getByText('Transfer Complete!')).toBeVisible();
  return fromAccountId;
}