import { test } from '../src/fixtures/test';
import {
  validateBookingDeleted,
  validateBookingUnchanged,
  validateForbidden,
} from '../src/validations/booking.validations';

test.describe('Delete booking', () => {
  test('should delete a booking with a token @smoke', async ({ bookings, token }) => {
    const { bookingid } = await bookings.seed();

    const response = await bookings.delete(bookingid, { token });

    await validateBookingDeleted(bookings, response, bookingid);
  });

  test('should forbid deleting a booking without credentials', async ({ bookings }) => {
    const { bookingid, booking } = await bookings.seed();

    const response = await bookings.delete(bookingid, 'none');

    await validateForbidden(response);
    await validateBookingUnchanged(bookings, bookingid, booking);
  });
});
