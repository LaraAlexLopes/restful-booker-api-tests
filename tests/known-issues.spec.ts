import { buildBooking, buildStay, uniqueFirstName } from '../src/data/booking.factory';
import { expect, test } from '../src/fixtures/test';
import {
  validateBookingNotListed,
  validateOnlyBookingsListed,
  validateStatus,
} from '../src/validations/booking.validations';

const knownIssue = (id: string) => ({ tag: '@known-issue', annotation: { type: 'issue', description: id } });

test.describe('Known issues', () => {
  test('KI-01 POST /auth should reject wrong credentials with 401', knownIssue('KI-01'), async ({ auth }) => {
    test.fail();
    const response = await auth.createToken({ username: 'admin', password: 'wrong-password' });

    await validateStatus(response, 401);
  });

  const missingFields = ['firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates'] as const;
  for (const field of missingFields) {
    test(
      `KI-02 POST /booking without ${field} should return 400, not 500`,
      knownIssue('KI-02'),
      async ({ bookings }) => {
        test.fail();
        const booking: Record<string, unknown> = buildBooking();
        delete booking[field];

        const response = await bookings.create(booking);

        await validateStatus(response, 400);
      },
    );
  }

  const invalidValues: { scenario: string; changes: Record<string, unknown> }[] = [
    { scenario: 'a text total price', changes: { totalprice: 'abc' } },
    { scenario: 'a negative total price', changes: { totalprice: -50 } },
    { scenario: 'a text deposit flag', changes: { depositpaid: 'yes' } },
    {
      scenario: 'an invalid check-in date',
      changes: { bookingdates: { checkin: 'not-a-date', checkout: '2027-01-10' } },
    },
    {
      scenario: 'a check-out before the check-in',
      changes: { bookingdates: { checkin: '2027-01-15', checkout: '2027-01-10' } },
    },
  ];
  for (const { scenario, changes } of invalidValues) {
    test(`KI-03 POST /booking should reject ${scenario}`, knownIssue('KI-03'), async ({ bookings }) => {
      test.fail();
      const response = await bookings.create({ ...buildBooking(), ...changes });

      await validateStatus(response, 400);
    });
  }

  test(
    'KI-04 PUT /booking/{id} should return 404 for a booking that does not exist',
    knownIssue('KI-04'),
    async ({ bookings, token }) => {
      test.fail();
      const response = await bookings.update(999_999_999, buildBooking(), { token });

      await validateStatus(response, 404);
    },
  );

  test(
    'KI-04 PATCH /booking/{id} should return 404 for a booking that does not exist',
    knownIssue('KI-04'),
    async ({ bookings, token }) => {
      test.fail();
      const response = await bookings.patch(999_999_999, { totalprice: 1 }, { token });

      await validateStatus(response, 404);
    },
  );

  test(
    'KI-05 DELETE /booking/{id} should return 404 for a booking that does not exist',
    knownIssue('KI-05'),
    async ({ bookings, token }) => {
      test.fail();
      const response = await bookings.delete(999_999_999, { token });

      await validateStatus(response, 404);
    },
  );

  test(
    'KI-06 GET /booking?checkin should include bookings that check in on that date',
    knownIssue('KI-06'),
    async ({ bookings }) => {
      test.fail();
      const firstname = uniqueFirstName();
      const stay = buildStay(60, 3);
      const { bookingid } = await bookings.seed({ firstname, bookingdates: stay });

      const response = await bookings.list({ firstname, checkin: stay.checkin });

      await validateOnlyBookingsListed(response, [bookingid]);
    },
  );

  test(
    'KI-07 GET /booking?checkout should not return bookings that check out before that date',
    knownIssue('KI-07'),
    async ({ bookings }) => {
      test.fail();
      const firstname = uniqueFirstName();
      const { bookingid } = await bookings.seed({ firstname, bookingdates: buildStay(60, 3) });

      const response = await bookings.list({ firstname, checkout: buildStay(200, 1).checkout });

      await validateBookingNotListed(response, bookingid);
    },
  );

  test(
    'KI-08 GET /booking/{id} should send XML with an XML content type',
    knownIssue('KI-08'),
    async ({ bookings }) => {
      test.fail();
      const { bookingid } = await bookings.seed();

      const response = await bookings.get(bookingid, { Accept: 'application/xml' });

      await validateStatus(response, 200);
      expect(response.headers()['content-type']).toMatch(/xml/);
    },
  );
});
