import { test, expect } from '@playwright/test';
import { loadRegion } from '../../src/core/config';
import { registerUser } from '../../src/web/registerUser';

const region = loadRegion();

test('accounts overview after an approved loan', async ({ page }) => {
  test.setTimeout(90_000);
  await registerUser(page, region);

  await page.getByRole('link', { name: 'Request Loan' }).click();
  await page.locator('#amount').fill('1000');
  await page.locator('#downPayment').fill('100');
  await expect(page.locator('#fromAccountId option').first()).toBeAttached();
  await page.getByRole('button', { name: 'Apply Now' }).click();
  //await page.pause(); // Used for manual inspection of the page during test execution

  await expect(page.locator('#loanStatus')).toHaveText('Approved');
  const loanAccountId = await page.locator('#newAccountId').innerText();
  //await page.pause(); // Used for manual inspection of the page during test execution

  await page.getByRole('link', { name: 'Accounts Overview' }).click();
  const table = page.locator('#accountTable');
  await expect(table).toContainText(loanAccountId);
  await expect(table).toContainText('$415.50');
  await expect(table).toContainText('$1000.00');
  await expect(table).toContainText('$1415.50');

  console.log(await table.innerText());
  //await page.pause(); // Used for manual inspection of the page during test execution
});