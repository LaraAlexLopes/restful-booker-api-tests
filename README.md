# Restful-Booker API Tests

[![API tests](https://github.com/LaraAlexLopes/restful-booker-api-tests/actions/workflows/api-tests.yml/badge.svg)](https://github.com/LaraAlexLopes/restful-booker-api-tests/actions/workflows/api-tests.yml)
[![Report](https://img.shields.io/badge/report-Playwright-2EAD33)](https://laraalexlopes.github.io/restful-booker-api-tests)

API test automation for [Restful-Booker](https://restful-booker.herokuapp.com/apidoc/index.html), a hotel booking API built for testing practice, written with **Playwright Test** and **TypeScript**. It runs in parallel against a pinned Docker image and every night against the public environment.

Every change is checked twice: in the response, and in what the API returns when the booking is read back. Defects are kept as tests that are expected to fail, so the suite reports when they get fixed.

Companion project: [ServeRest API Tests](https://github.com/LaraAlexLopes/serverest-api-tests) covers a different API with Postman and Newman.

## Stack

Playwright Test · TypeScript · Zod · Faker · Docker · GitHub Actions

## What is covered

**Regression: 22 tests**

| Area   | Scenarios                                                                                      | Checked after the call          |
| ------ | ---------------------------------------------------------------------------------------------- | ------------------------------- |
| Health | API is up (`/ping`)                                                                            | —                               |
| Auth   | Token issued and accepted for an update                                                        | Booking stored with the changes |
| Create | 5 variants: every field, no optional field, deposit not paid, one-night stay, accented names   | Booking read back is identical  |
| Read   | By id, listed among all, filtered by name, filtered by check-in, unknown id (404), XML content | —                               |
| Update | Full update with token and with basic auth, partial update keeping other fields                | Booking stored with the changes |
| Update | Full and partial update without credentials and with an invalid token (4 cases)                | Booking unchanged               |
| Delete | Delete with token                                                                              | Booking no longer found         |
| Delete | Delete without credentials                                                                     | Booking unchanged               |

**Known issues: 17 tests** covering 8 defects (see below).

**Contract:** every JSON response is parsed with a strict [Zod](https://zod.dev) schema in [`src/schemas`](src/schemas). An unexpected or missing field fails the test.

## Findings

Each defect has tests marked with [`test.fail()`](https://playwright.dev/docs/api/class-test#test-fail) and tagged `@known-issue`. They pass while the defect exists. If a defect is fixed, its test **fails** with "expected to fail, but passed", which signals that it can move to the regression suite.

| ID    | Severity | Defect                                                                                                                                                                                     | Expected                         |
| ----- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| KI-01 | Medium   | `POST /auth` with wrong credentials returns `200` with `{"reason":"Bad credentials"}`                                                                                                      | `401 Unauthorized`               |
| KI-02 | Medium   | `POST /booking` missing any required field returns `500 Internal Server Error` (5 fields)                                                                                                  | `400` naming the field           |
| KI-03 | High     | `POST /booking` accepts invalid values (5 cases): text price stored as `null`, negative price, `"yes"` coerced to `true`, invalid date stored as `"0NaN-aN-aN"`, check-out before check-in | `400 Bad Request`                |
| KI-04 | Low      | `PUT` and `PATCH /booking/{id}` for an unknown id return `405 Method Not Allowed`                                                                                                          | `404 Not Found`                  |
| KI-05 | Low      | `DELETE /booking/{id}` for an unknown id returns `405 Method Not Allowed`                                                                                                                  | `404 Not Found`                  |
| KI-06 | Medium   | `GET /booking?checkin=` leaves out bookings that check in **on** that date                                                                                                                 | Check-in ≥ date (as documented)  |
| KI-07 | High     | `GET /booking?checkout=` returns bookings that check out **before** the date                                                                                                               | Check-out ≥ date (as documented) |
| KI-08 | Low      | XML responses are sent with `Content-Type: text/html`                                                                                                                                      | `application/xml`                |

**Root cause of KI-06 and KI-07.** The [API docs](https://restful-booker.herokuapp.com/apidoc/index.html) describe both filters as "greater than or equal to the set date". `routes/index.js` in the Docker image builds the query with `$gt` for check-in, which drops the equal date, and `$lt` for check-out, which inverts the filter:

```js
query['bookingdates.checkin'] = { $gt: new Date(req.query.checkin).toISOString() };
query['bookingdates.checkout'] = { $lt: new Date(req.query.checkout).toISOString() };
```

**Documented quirks, tested as they are.** `DELETE` returns `201 Created` and `/ping` returns `201 Created`. Both are in the API docs, so the regression suite asserts them, and they are listed here as HTTP semantics issues rather than defects.

## How it is built

```
src/
├── api/          AuthClient and BookingClient over Playwright's APIRequestContext
├── schemas/      strict Zod schemas (and the TypeScript types inferred from them)
├── data/         Faker builders: bookings, future stays, unique names
├── fixtures/     test.extend fixtures (auth, token, bookings) and global setup/teardown
└── validations/  reusable checks: validateBookingCreated, validateBookingUpdated, validateForbidden…
tests/            one spec per area, plus known-issues.spec.ts
```

Specs read as arrange → act → validate:

```ts
test('should forbid a full update with an invalid token', async ({ bookings }) => {
  const { bookingid, booking } = await bookings.seed();

  const response = await bookings.update(bookingid, buildBooking(), { token: 'invalid-token' });

  await validateForbidden(response);
  await validateBookingUnchanged(bookings, bookingid, booking);
});
```

- **Authorization is a parameter.** `{ token }` sends the cookie, `'basic'` sends HTTP basic auth and `'none'` sends nothing, so one test can cover each way in.
- **Parameterized tests** cover booking variants, the unauthorized cases and the invalid payloads without duplicated test bodies.

## Test data

1. **Generated:** guests, prices, needs and stays come from Faker. Stays are always in the future.
2. **Cleaned by the fixture:** every booking created through the `bookings` fixture, by the test or by `seed()`, is deleted after the test, even when it fails.
3. **Swept at the end:** every booking carries the run tag as last name (`Qa<runId>`). The global teardown deletes anything left with that tag.
4. **Isolated in parallel:** tests that filter use unique first names, so bookings created by other tests running at the same time cannot match.

The suite was run 10 times in a row (`--repeat-each=10`, 390 tests) without a single failure, leaving no data behind.

## Running locally

**Requirements:** Node 24 (`nvm use`) and Docker. No browsers are needed.

```bash
nvm use
npm install
npm run server:up      # Restful-Booker on http://localhost:3001 (pinned image digest)
npm test               # full suite, in parallel
npm run test:smoke     # @smoke only
npm run test:public    # against https://restful-booker.herokuapp.com
npm run report         # open the HTML report
npm run server:down
```

Settings live in `.env` (see [`.env.example`](.env.example)): `BASE_URL`, `ADMIN_USERNAME` and `ADMIN_PASSWORD`.

## CI

[`.github/workflows/api-tests.yml`](.github/workflows/api-tests.yml):

1. **Quality:** lint, typecheck, format.
2. **Local:** Restful-Booker in Docker, then the full suite. The HTML and JUnit reports are uploaded and, on `main`, published to GitHub Pages.
3. **Public:** every night (and on demand), the suite runs against the public environment.

## Conventions

- Code, test names, commits and docs are in English.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org), enforced by commitlint.
- The pre-commit hook runs lint, typecheck and the format check.

## Author

**Lara Lopes**, QA Engineer · [LinkedIn](https://linkedin.com/in/laraalexandralopes) · [GitHub](https://github.com/LaraAlexLopes)
