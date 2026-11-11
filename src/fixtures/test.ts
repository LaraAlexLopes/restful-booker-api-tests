import { test as base } from '@playwright/test';

import { AuthClient } from '../api/auth.client';
import { BookingClient } from '../api/booking.client';

interface ApiFixtures {
  auth: AuthClient;
  bookings: BookingClient;
  token: string;
}

export const test = base.extend<ApiFixtures>({
  auth: async ({ request }, use) => {
    await use(new AuthClient(request));
  },

  token: async ({ auth }, use) => {
    await use(await auth.adminToken());
  },

  bookings: async ({ request }, use) => {
    const bookings = new BookingClient(request);
    await use(bookings);
    await bookings.deleteCreated();
  },
});

export { expect } from '@playwright/test';
