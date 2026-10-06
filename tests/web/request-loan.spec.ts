import { test, expect } from '@playwright/test';
import { loadRegion } from '../../src/core/config';
import { registerUser } from '../../src/web/registerUser';

const region = loadRegion();

test('explore loan outcomes', async ({ page }) => {
  test.setTimeout(180_000);
  await registerUser(page, region);

  const combos = [
    { amount: '1000', down: '100' },
    { amount: '1000', down: '200' },
    { amount: '1000', down: '500' },
    { amount: '100', down: '10' },
    { amount: '100', down: '50' },
  ];

  for (const { amount, down } of combos) {
    await page.getByRole('link', { name: 'Request Loan' }).click();
    await page.locator('#amount').fill(amount);
    await page.locator('#downPayment').fill(down);
    //await page.pause(); // Pause for manual inspection

    await expect(page.locator('#fromAccountId option').first()).toBeAttached();
    await page.getByRole('button', { name: 'Apply Now' }).click();
    //await page.pause(); // Pause for manual inspection

    await expect(page.getByText('Loan Request Processed')).toBeVisible();
    const status = await page.locator('#loanStatus').innerText();
    console.log(`amount=${amount} down=${down} -> ${status}`);
    //await page.pause(); // Pause for manual inspection

  }
});