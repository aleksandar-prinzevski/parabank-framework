import { test, expect } from '@playwright/test';
import { loadRegion } from '../../src/core/config';
import { loadApiUser } from '../../src/api/testUser';
import { customerSchema } from '../../src/api/schemas';

const region = loadRegion();

test('API: login returns a customer matching the schema', async ({ request }) => {
  const user = loadApiUser(); // read inside the test: the setup project has already created the file

  const response = await request.get(`login/${user.username}/${user.password}`, {
    headers: { accept: 'application/json' },
  });

  expect(response.status()).toBe(200);
  const customer = customerSchema.parse(await response.json());
  expect(customer.firstName).toBe(region.customer.firstName);
});