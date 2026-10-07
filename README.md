[README.md](https://github.com/user-attachments/files/33155067/README.md)
# ParaBank multi-region test framework (Playwright + TypeScript)

A test framework for a banking application with a web UI and a REST API. The API and Web layers run independently, share one infrastructure, and the same tests run for every region by changing one setting.

## Application under test: why ParaBank

I chose **ParaBank** because it fits the brief closely:

- **Financial domain:** real banking flows (registration, accounts, transfers, bill pay, loans), which match the payments/accounts context of the task.
- **Both layers in one system:** a web UI and a documented REST API (Swagger), so the API-assisted web test and the shared infrastructure are realistic.
- **Intentional defects:** gives genuine negative and edge-case scenarios to test.
- **Free and self-hostable:** the public site can be replaced by a Docker container, which made CI stable.

Trade-offs: the public instance is shared, resets periodically, is rate limited, and has no real regional behavior, so regions are simulated through configuration (see "Regions" below). I handled this with fresh data per test, a single worker, and a private container in CI.

## Requirements checklist

### 1. API and Web layers are independently runnable but share common infrastructure

- **Independent:** `playwright.config.ts` defines two projects. `npx playwright test --project=web` runs only `tests/web/`, and `npx playwright test --project=api` runs only `tests/api/`. In CI they are separate jobs.
- **Shared infrastructure:**
  - `src/core/config.ts`: region loading, used by both layers.
  - `src/api/client.ts` and `src/api/schemas.ts`: the API client and response schemas, used by API tests and by web tests.
  - `src/web/registerUser.ts`: also used by the API setup project (`tests/setup/api-user.setup.spec.ts`) to create the API test user.

### 2. Switching regions requires no test code modifications

- Region data lives in `config/regions/mk.json` and `config/regions/de.json`. Tests never contain region values; they read them from the loaded region.
- The region is chosen with the `REGION` environment variable, for example `REGION=de npx playwright test`. The same tests run unchanged for both regions, locally and in CI (the CI matrix runs `mk` and `de`).
- Adding a region means adding one JSON file.

### 3. Happy path, an error state, and an idempotency or edge case, for both Web and API

| | Happy path | Error state | Idempotency / edge case |
|---|---|---|---|
| **Web** | `register.spec.ts`, `login.spec.ts`, `open-account.spec.ts`, `transfer.spec.ts`, `find-transactions.spec.ts`, `accounts-overview.spec.ts`, `bill-pay.spec.ts`, `request-loan.spec.ts`, `loan-overview.spec.ts`, `lookup-customer.spec.ts` | `transfer-negative.spec.ts` (transfer above the balance, negative amount) | `transfer-edge.spec.ts` (transfer of the entire balance, double-click on Transfer) |
| **API** | `e2e-flow.api.spec.ts` (login, accounts, create account, transfer, transactions, bill pay) and `login.api.spec.ts` | `negative.api.spec.ts` (unknown account, wrong password) | `edge-cases.api.spec.ts` (zero and negative amounts, repeated identical transfer) |

Some of these scenarios expose real application defects. Those tests assert the correct behavior and are marked `test.fail`, so they count as expected failures while the defect exists (see "Application defects" below).

### 4. A Web test that uses an API operation

`tests/web/api-setup.spec.ts`: it registers a user in the browser, then uses the `BankApi` helper (`src/api/client.ts`) to log in, create a savings account, and transfer $25 through the API. Finally it opens Accounts Overview in the browser and checks that the UI shows the account and the balances the API produced.

### 5. An API test that performs schema validation

Response shapes are declared with Zod in `src/api/schemas.ts` (customer, account, transaction, bill payment). They are enforced in `tests/api/login.api.spec.ts` (customer) and in each step of `tests/api/e2e-flow.api.spec.ts` (customer, account, transactions). A missing field or a wrong type fails the test with a message naming the field.

### 6. CI pipeline that runs the layers independently or together

`.github/workflows/ci.yml`:
- Runs automatically on every push and pull request, executing the API and web jobs for both regions.
- Can be started manually (**Actions → CI → Run workflow**) with a **layer** choice (`all`, `api`, `web`) and a **region** choice (`all`, `mk`, `de`).
- Each job starts a private ParaBank container, initializes its database, runs one layer for one region, and uploads the report as an artifact.

## Design decisions

| Decision | Why |
|---|---|
| **Two Playwright projects, `web` and `api`** | Each layer runs on its own (`--project=web` / `--project=api`), but both import the same shared code. |
| **One JSON file per region** (`config/regions/mk.json`, `de.json`) | A new region means adding a file, not changing tests. The region comes from the `REGION` environment variable (default `mk`). |
| **`BASE_URL` override** | The same region can be pointed at the public site or at a local ParaBank container. CI uses a container. |
| **Fresh user per test** | The public instance resets and breaks shared data. Every test registers its own user, with unique personal data, so tests never depend on each other. |
| **API tests get one fresh user from a setup project** | The API cannot create customers, so a setup step registers one user in a browser, saves the credentials to `.auth/api-user.json`, and every API test reads them. |
| **Schema validation with Zod** (`src/api/schemas.ts`) | API responses are checked against a declared shape, so a changed field fails with a clear message. |
| **API calls inside web tests** (`src/api/client.ts`) | The `BankApi` helper lets a web test set up or verify data through the API (see `tests/web/api-setup.spec.ts`). |
| **Known defects are written as `test.fail`** | The test asserts the **correct** behavior. While the bug exists it counts as an expected failure, and it turns red if the application is ever fixed. |
| **`workers: 1`, `retries: 1`** | The public site sits behind rate limiting (see below), so the suite runs one test at a time and retries once. |
| **Helpers only for repeated steps** (`registerUser`, `openSavingsAccount`, `transferFunds`) | Setup is shared, assertions stay in the test so a reader sees what is verified. |

## Project structure

```
config/regions/        one JSON file per region (mk, de)
src/core/config.ts     loads the region (REGION, BASE_URL)
src/api/               API client, Zod schemas, test-user helper
src/web/               UI helpers (registration, accounts, transfers)
tests/web/             browser tests
tests/api/             API tests
tests/setup/           registers the user used by the API tests
.github/workflows/     CI pipeline
```

## How to run locally

Requirements: Node.js 22+ and Git.

```bash
npm ci
npx playwright install chromium
```

Run everything for the default region (`mk`), against the public site:

```bash
npx playwright test
```

Run one layer, or one region:

```bash
npx playwright test --project=web
npx playwright test --project=api
REGION=de npx playwright test --project=web          # bash / macOS / Linux
$env:REGION="de"; npx playwright test --project=web  # PowerShell
```

Running the API project first runs the setup project automatically, because it is declared as a dependency.

Useful while developing: `--headed` (see the browser), `--ui` (interactive mode), `--debug` (step through).

### Run against your own ParaBank (recommended)

The public site is slow, rate limited, and its data is shared with other people. To run against a private instance (requires Docker):

```bash
docker run -d -p 8080:8080 parasoft/parabank
curl -X POST http://localhost:8080/parabank/services/bank/initializeDB
BASE_URL=http://localhost:8080/parabank npx playwright test
```

The `initializeDB` call is required: a fresh container has an empty database and registration fails with "An internal error has occurred" until it is initialized.

## Test coverage

| | Happy path | Error state | Edge case / idempotency |
|---|---|---|---|
| **Web** | register, login, open account, transfer, find transaction, account overview, bill pay, loan request, loan overview | transfer above the balance, negative amount | transfer of the whole balance, double-click on Transfer |
| **API** | login, list accounts, create account, transfer, transactions, search by amount, bill pay (one end-to-end flow) | unknown account (400), wrong password (400) | zero and negative amounts, repeated identical transfer |

Also: schema validation on the API responses, and a web test that uses the API for setup (`api-setup.spec.ts`).

## CI (GitHub Actions)

`.github/workflows/ci.yml` runs on every push and pull request, and manually from **Actions → CI → Run workflow**, where you choose:

- **layer:** `all`, `api`, or `web`
- **region:** `all`, `mk`, or `de`

Each job starts its own ParaBank container, initializes the database, and runs the tests for one layer and one region. HTML reports and test results are uploaded as artifacts.

## Application defects and quirks found

Observed while building the tests. Where I did not confirm the cause, it is marked as such.

**Defects (covered by `test.fail` tests)**
- A transfer of **zero or a negative amount is accepted** (API and web). A negative amount moves the money in the wrong direction.
- A transfer **above the available balance is accepted** (web: $10,000 from about $415).
- A **repeated identical transfer is applied twice** (API), and a **double-click on Transfer moves the money twice** (web). There is no duplicate protection.

**Quirks**
- The response of `createAccount` shows `"balance": 0`, but reading the same account right after shows the opening deposit (100).
- A new user's total grows by the loan amount after an approved loan, because the loan account is listed with a positive balance.
- The first loan request of $1000 with a $100 down payment was denied once ("insufficient funds") and approved every time after. Cause not confirmed.
- A long generated username was reported as "user already exists". Tests use a short, unique one. Cause not confirmed.
- On the public site, newly registered users with duplicated personal details (same name, address, phone) hit "An internal error has occurred" on every account page. A user with fully unique data worked. Cause not confirmed, so tests generate unique personal data per run.
- The transfer endpoint answers in plain text, not JSON.

**Environment**
- The public ParaBank sits behind **Cloudflare rate limiting** (HTTP 429, "Error 1015") when the suite runs in parallel or repeatedly. This is why the suite uses a single worker.
- The public data is shared and reset periodically, and the shared `john/demo` account stopped working after repeated heavy test runs, so no test depends on it.
- A fresh ParaBank container needs its database initialized (see above), and its `admin.htm` page showed an internal error there.

## Regions: what is real and what is simulated

ParaBank has **no regional behavior**: the same application answers for every region. The regions here differ only in configuration (customer data, and in a real project base URLs, currencies, limits). The proof of the design is that the **same tests pass for `mk` and `de` with no code changes** (both run in CI). Region-specific behavior (for example a feature that exists only in one region) would be added as a flag in that region's file, with the test skipping itself when the flag is off. I did not invent rules that ParaBank cannot enforce.

## Mobile (design only, not implemented)

A third Playwright-style project, `mobile`, using Appium (Android and iOS) with the same structure:

- reuses `config/regions` (plus device settings per region: platform, OS version, app build) and the `REGION` switch;
- reuses `src/api` for setup and verification (create a user and data through the API, then check them in the app);
- uses the same reporting format and the CI matrix gets a `mobile` layer, with Android on Linux emulators and iOS on macOS runners;
- app screens are modeled as page objects, as on the web side.

## Use of AI tools

AI assistance was used for design discussion and drafting code. All tests were run and verified, and failures were analyzed against the real application and CI logs.
