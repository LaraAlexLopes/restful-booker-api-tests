import { buildBooking } from '../src/data/booking.factory';
import { test } from '../src/fixtures/test';
import { validateBookingUpdated, validateTokenIssued } from '../src/validations/booking.validations';

test.describe('Auth', () => {
  test('should issue a token that authorizes changes to a booking @smoke', async ({ auth, bookings }) => {
    const { bookingid } = await bookings.seed();
    const changes = buildBooking();

    const token = await validateTokenIssued(await auth.createToken());
    const response = await bookings.update(bookingid, changes, { token });

    await validateBookingUpdated(bookings, response, bookingid, changes);
  });
});
