import type { Authorization } from '../src/api/booking.client';
import { buildBooking } from '../src/data/booking.factory';
import { test } from '../src/fixtures/test';
import {
  validateBookingUnchanged,
  validateBookingUpdated,
  validateForbidden,
} from '../src/validations/booking.validations';

test.describe('Update booking', () => {
  test('should replace a booking using a token', async ({ bookings, token }) => {
    const { bookingid } = await bookings.seed();
    const changes = buildBooking();

    const response = await bookings.update(bookingid, changes, { token });

    await validateBookingUpdated(bookings, response, bookingid, changes);
  });

  test('should replace a booking using basic authentication', async ({ bookings }) => {
    const { bookingid } = await bookings.seed();
    const changes = buildBooking();

    const response = await bookings.update(bookingid, changes, 'basic');

    await validateBookingUpdated(bookings, response, bookingid, changes);
  });

  test('should change only the fields sent in a partial update', async ({ bookings, token }) => {
    const { bookingid, booking } = await bookings.seed();
    const changes = { totalprice: booking.totalprice + 100, additionalneeds: 'Late checkout' };

    const response = await bookings.patch(bookingid, changes, { token });

    await validateBookingUpdated(bookings, response, bookingid, { ...booking, ...changes });
  });

  const unauthorized: { scenario: string; authorization: Authorization }[] = [
    { scenario: 'without credentials', authorization: 'none' },
    { scenario: 'with an invalid token', authorization: { token: 'invalid-token' } },
  ];

  for (const { scenario, authorization } of unauthorized) {
    test(`should forbid a full update ${scenario}`, async ({ bookings }) => {
      const { bookingid, booking } = await bookings.seed();

      const response = await bookings.update(bookingid, buildBooking(), authorization);

      await validateForbidden(response);
      await validateBookingUnchanged(bookings, bookingid, booking);
    });

    test(`should forbid a partial update ${scenario}`, async ({ bookings }) => {
      const { bookingid, booking } = await bookings.seed();

      const response = await bookings.patch(bookingid, { totalprice: 1 }, authorization);

      await validateForbidden(response);
      await validateBookingUnchanged(bookings, bookingid, booking);
    });
  }
});
