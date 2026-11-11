import { buildBooking } from '../src/data/booking.factory';
import { test } from '../src/fixtures/test';
import type { Booking } from '../src/schemas/booking.schema';
import { validateBookingCreated } from '../src/validations/booking.validations';

const variants: { scenario: string; overrides: Partial<Booking> }[] = [
  { scenario: 'with every field @smoke', overrides: {} },
  { scenario: 'without the optional additional needs', overrides: { additionalneeds: undefined } },
  { scenario: 'with the deposit not paid', overrides: { depositpaid: false } },
  { scenario: 'with a one-night stay', overrides: { bookingdates: { checkin: '2027-03-10', checkout: '2027-03-11' } } },
  { scenario: 'with accented names', overrides: { firstname: 'João', additionalneeds: 'Café da manhã' } },
];

test.describe('Create booking', () => {
  for (const { scenario, overrides } of variants) {
    test(`should create and store a booking ${scenario}`, async ({ bookings }) => {
      const booking = JSON.parse(JSON.stringify(buildBooking(overrides))) as Booking;

      const response = await bookings.create(booking);

      await validateBookingCreated(bookings, response, booking);
    });
  }
});
