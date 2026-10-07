import * as fs from 'node:fs';
import * as path from 'node:path';

export interface RegionConfig {
  code: string;
  name: string;
  baseUrl: string;
  customer: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    ssn: string;
    password: string;
  };


}

export function loadRegion(): RegionConfig {
  const code = (process.env.REGION ?? 'mk').toLowerCase();
  const file = path.resolve(__dirname, '../../config/regions', `${code}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`Unknown region "${code}". Expected file: ${file}`);
  }
  const region = JSON.parse(fs.readFileSync(file, 'utf-8')) as RegionConfig;
  // BASE_URL lets CI point the same region at a local ParaBank container instead of the public site.
  return { ...region, baseUrl: process.env.BASE_URL ?? region.baseUrl };
}