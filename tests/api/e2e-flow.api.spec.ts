import { test, expect } from '@playwright/test';
import { z } from 'zod';
import { loadRegion } from '../../src/core/config';
import { customerSchema, accountSchema } from '../../src/api/schemas';

const region = loadRegion();
const user = region.existingUser;
const json = { accept: 'application/json' };

test('API e2e: login, accounts, create account, verify it', async ({ request }) => {
  const customer = await test.step('1. login', async () => {
    const res = await request.get(`login/${user.username}/${user.password}`, { headers: json });
    expect(res.status()).toBe(200);
    return customerSchema.parse(await res.json());
  });

  const fundingAccount = await test.step('2. list accounts', async () => {
    const res = await request.get(`customers/${customer.id}/accounts`, { headers: json });
    expect(res.status()).toBe(200);
    const accounts = z.array(accountSchema).parse(await res.json());
    expect(accounts.length).toBeGreaterThan(0);
    return accounts[0];
  });

  const accountB = await test.step('3. create savings account B', async () => {
    const res = await request.post(
      `createAccount?customerId=${customer.id}&newAccountType=1&fromAccountId=${fundingAccount.id}`,
      { headers: json },
    );
    console.log(res.status(), await res.text());
    expect(res.status()).toBe(200);
    return accountSchema.parse(await res.json());
  });

  await test.step('4. get account B', async () => {
    const res = await request.get(`accounts/${accountB.id}`, { headers: json });
    expect(res.status()).toBe(200);
    const account = accountSchema.parse(await res.json());
    expect(account.id).toBe(accountB.id);
    expect(account.type).toBe('SAVINGS');
    expect(account.customerId).toBe(customer.id);
    console.log('Account B balance:', account.balance);
  });
});