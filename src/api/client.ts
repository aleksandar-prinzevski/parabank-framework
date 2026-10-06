import { APIRequestContext, expect } from '@playwright/test';
import { z } from 'zod';
import { RegionConfig } from '../core/config';
import { accountSchema, customerSchema } from './schemas';

const json = { accept: 'application/json' };

// Thin wrapper around the ParaBank REST API. It builds full URLs from the region config,
// so it works both in API tests and inside web tests (where the base URL points at the website).
export class BankApi {
  constructor(private request: APIRequestContext, private region: RegionConfig) {}

  private url(path: string) {
    return `${this.region.baseUrl}/services/bank/${path}`;
  }

  async login(username: string, password: string) {
    const res = await this.request.get(this.url(`login/${username}/${password}`), { headers: json });
    expect(res.status()).toBe(200);
    return customerSchema.parse(await res.json());
  }

  async getAccounts(customerId: number) {
    const res = await this.request.get(this.url(`customers/${customerId}/accounts`), { headers: json });
    expect(res.status()).toBe(200);
    return z.array(accountSchema).parse(await res.json());
  }

  async createSavingsAccount(customerId: number, fromAccountId: number) {
    const res = await this.request.post(
      this.url(`createAccount?customerId=${customerId}&newAccountType=1&fromAccountId=${fromAccountId}`),
      { headers: json },
    );
    expect(res.status()).toBe(200);
    return accountSchema.parse(await res.json());
  }

  async transfer(fromAccountId: number, toAccountId: number, amount: number) {
    const res = await this.request.post(
      this.url(`transfer?fromAccountId=${fromAccountId}&toAccountId=${toAccountId}&amount=${amount}`),
      { headers: json },
    );
    expect(res.status()).toBe(200);
  }
}