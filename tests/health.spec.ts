import { expect, test } from '../src/fixtures/test';
import { validateStatus } from '../src/validations/booking.validations';

test('should report that the API is up @smoke', async ({ request }) => {
  const response = await request.get('/ping');

  await validateStatus(response, 201);
  expect(await response.text()).toBe('Created');
});
