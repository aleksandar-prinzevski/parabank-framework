import { test, expect } from '@playwright/test';
import { loadRegion } from '../../src/core/config';
import { customerSchema } from '../../src/api/schemas';

const region = loadRegion();
const user = region.existingUser;

test('API: login returns a customer matching the schema', async ({ request }) => {
  const response = await request.get(`login/${user.username}/${user.password}`, {
    headers: { accept: 'application/json' },
  });

  expect(response.status()).toBe(200);
  const customer = customerSchema.parse(await response.json());
  expect(customer.firstName).toBe('John');
});