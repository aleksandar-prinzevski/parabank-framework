import { test, expect } from '@playwright/test';
import { z } from 'zod';
import { loadRegion } from '../../src/core/config';
import { customerSchema, accountSchema, transactionSchema } from '../../src/api/schemas';

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

  const amount = 12.34;

  await test.step('5. transfer A -> B', async () => {
    const res = await request.post(
      `transfer?fromAccountId=${fundingAccount.id}&toAccountId=${accountB.id}&amount=${amount}`,
      { headers: json },
    );
    console.log(res.status(), await res.text());
    expect(await res.text()).toContain('Successfully transferred $12.34');
  });

  await test.step('6. transaction appears on B', async () => {
    const res = await request.get(`accounts/${accountB.id}/transactions`, { headers: json });
    expect(res.status()).toBe(200);
    const txs = z.array(transactionSchema).parse(await res.json());
    console.log(txs);
    expect(txs).toHaveLength(2);
    expect(txs.filter((t) => t.amount === amount)).toHaveLength(1);
  });

  await test.step('7. search by amount', async () => {
    const res = await request.get(`accounts/${accountB.id}/transactions/amount/${amount}`, { headers: json });
    expect(res.status()).toBe(200);
    const txs = z.array(transactionSchema).parse(await res.json()); 
    expect(txs.length).toBeGreaterThan(0);
  });

  await test.step('8. pay a bill from B', async () => {
    const res = await request.post(`billpay?accountId=${accountB.id}&amount=5`, {
      headers: json,
      data: {
        name: 'Electric Company',
        address: { street: 'Partizanska', city: 'Skopje', state: 'Skopje', zipCode: '1000' },
        phoneNumber: '070555123',
        accountNumber: 12345,
      },
    });
    console.log(res.status(), await res.text());
    expect(res.status()).toBe(200);
  });

});