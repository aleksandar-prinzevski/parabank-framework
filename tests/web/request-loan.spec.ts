import { test, expect } from '@playwright/test';
import { loadRegion } from '../../src/core/config';
import { registerUser } from '../../src/web/registerUser';

const region = loadRegion();

// Loan request: $1000 with a $100 down payment from the new user's checking account.
// Observed in exploration: this combination is approved and creates a loan account.
test('request a loan', async ({ page }) => {
  test.setTimeout(90_000);
  await registerUser(page, region);

  await page.getByRole('link', { name: 'Request Loan' }).click();
  await page.locator('#amount').fill('1000');
  await page.locator('#downPayment').fill('100');
  await expect(page.locator('#fromAccountId option').first()).toBeAttached();
  await page.getByRole('button', { name: 'Apply Now' }).click();

  await expect(page.getByText('Loan Request Processed')).toBeVisible();
  await expect(page.locator('#loanStatus')).toHaveText('Approved');
});