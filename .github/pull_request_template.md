## Summary

<!-- What does this PR change, and why? -->

## Type of change

- [ ] New test scenarios
- [ ] Fix for a failing or flaky test
- [ ] Framework change (clients, fixtures, validations, schemas, test data)
- [ ] CI, tooling or documentation

## Scenarios

<!-- One line per scenario added or changed. Delete this section if there are none. -->

| Spec | Scenario | Backend check |
| ---- | -------- | ------------- |
|      |          |               |

## Test data

- [ ] Data is generated (Faker), not hard-coded
- [ ] Bookings are created through the `bookings` fixture, so they are deleted after the test
- [ ] Filters use unique names, so parallel tests cannot interfere

## How it was verified

- [ ] `npm run lint`, `npm run typecheck` and `npm run format:check` pass
- [ ] `npm test` passes against a local Restful-Booker
- [ ] `npx playwright test --repeat-each=5` passes (no flakiness)
- [ ] New responses are validated against a Zod schema
- [ ] Defects are covered with `test.fail()` and the `@known-issue` tag, not skipped

**CI run:**

## Flakiness and risks

<!-- Waits added, retries, known unstable areas, anything the reviewer should look at closely. -->

## Screenshots or report

<!-- Allure report link, screenshots or the screen dump of a failure, when relevant. -->
