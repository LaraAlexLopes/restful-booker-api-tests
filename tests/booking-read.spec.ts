import { expect, test } from '../src/fixtures/test';
import { buildStay, uniqueFirstName } from '../src/data/booking.factory';
import {
  validateBookingListed,
  validateBookingNotFound,
  validateBookingStored,
  validateOnlyBookingsListed,
  validateStatus,
} from '../src/validations/booking.validations';

test.describe('Read bookings', () => {
  test('should get a booking by id', async ({ bookings }) => {
    const { bookingid, booking } = await bookings.seed();

    await validateBookingStored(bookings, bookingid, booking);
  });

  test('should list a new booking among all bookings', async ({ bookings }) => {
    const { bookingid } = await bookings.seed();

    const response = await bookings.list();

    await validateBookingListed(response, bookingid);
  });

  test('should filter bookings by first and last name', async ({ bookings }) => {
    const { bookingid, booking } = await bookings.seed({ firstname: uniqueFirstName() });
    await bookings.seed({ firstname: `${booking.firstname}x` });

    const response = await bookings.list({ firstname: booking.firstname, lastname: booking.lastname });

    await validateOnlyBookingsListed(response, [bookingid]);
  });

  test('should filter bookings that check in after a date', async ({ bookings }) => {
    const firstname = uniqueFirstName();
    await bookings.seed({ firstname, bookingdates: buildStay(40, 3) });
    const late = await bookings.seed({ firstname, bookingdates: buildStay(400, 3) });

    const response = await bookings.list({ firstname, checkin: buildStay(200, 1).checkin });

    await validateOnlyBookingsListed(response, [late.bookingid]);
  });

  test('should return 404 for a booking that does not exist', async ({ bookings }) => {
    await validateBookingNotFound(bookings, 999_999_999);
  });

  test('should return the booking content as XML when asked for XML', async ({ bookings }) => {
    const { bookingid, booking } = await bookings.seed();

    const response = await bookings.get(bookingid, { Accept: 'application/xml' });

    await validateStatus(response, 200);
    const body = await response.text();
    expect(body).toMatch(/^<\?xml/);
    expect(body).toContain(`<firstname>${booking.firstname}</firstname>`);
  });
});
