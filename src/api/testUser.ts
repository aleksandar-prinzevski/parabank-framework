import * as fs from 'node:fs';
import * as path from 'node:path';

// Credentials of the user the setup step registers for the API run.
export const API_USER_FILE = path.resolve(__dirname, '../../.auth/api-user.json');

export function loadApiUser(): { username: string; password: string } {
  return JSON.parse(fs.readFileSync(API_USER_FILE, 'utf-8'));
}