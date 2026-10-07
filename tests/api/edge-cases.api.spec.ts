import { test, expect } from '@playwright/test';
import { z } from 'zod';
import { loadRegion } from '../../src/core/config';
import { customerSchema, accountSchema } from '../../src/api/schemas';
import { loadApiUser } from '../../src/api/testUser';

const region = loadRegion();
const json = { accept: 'application/json' };

// Edge cases: valid requests with unusual values, and repeated requests.
// Every test gets its own fresh target account, so tests don't affect each other.
test.describe('transfers on a fresh account', () => {
  let fromId: number;
  let toId: number;

  // Setup: log in, take the first existing account as the source, and create a new savings account as the target.
  test.beforeEach(async ({ request }) => {
    const user = loadApiUser();
    const login = await request.get(`login/${user.username}/${user.password}`, { headers: json });
    const customer = customerSchema.parse(await login.json());
    const list = await request.get(`customers/${customer.id}/accounts`, { headers: json });
    fromId = z.array(accountSchema).parse(await list.json())[0].id;
    const created = await request.post(
      `createAccount?customerId=${customer.id}&newAccountType=1&fromAccountId=${fromId}`,
      { headers: json },
    );
    toId = accountSchema.parse(await created.json()).id;
  });

  // Known defect: zero and negative amounts should be rejected, but ParaBank accepts them.
  for (const amount of ['0', '-5']) {
    test.fail(`rejects transfer amount ${amount}`, async ({ request }) => {
      const res = await request.post(
        `transfer?fromAccountId=${fromId}&toAccountId=${toId}&amount=${amount}`,
        { headers: json },
      );
      expect(res.status()).toBeGreaterThanOrEqual(400);
    });
  }

  // Known defect: a repeated identical transfer is applied twice (no idempotency protection).
  test.fail('a repeated transfer is applied only once', async ({ request }) => {
    const url = `transfer?fromAccountId=${fromId}&toAccountId=${toId}&amount=7.77`;
    await request.post(url, { headers: json });
    await request.post(url, { headers: json });

    const txs = await request.get(`accounts/${toId}/transactions`, { headers: json });
    const count = (await txs.json()).filter((t: { amount: number }) => t.amount === 7.77).length;
    expect(count).toBe(1);
  });
});