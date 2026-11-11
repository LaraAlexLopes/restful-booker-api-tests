import { request } from '@playwright/test';

import { BookingClient } from '../api/booking.client';
import { runTag } from '../config';
import { BookingIdsSchema } from '../schemas/booking.schema';

export default async function globalTeardown(): Promise<void> {
  const context = await request.newContext({
    baseURL: process.env.BASE_URL ?? 'http://localhost:3001',
    extraHTTPHeaders: { Accept: 'application/json' },
  });
  const bookings = new BookingClient(context);
  const leftovers = BookingIdsSchema.parse(await (await bookings.list({ lastname: runTag() })).json());
  for (const { bookingid } of leftovers) await bookings.delete(bookingid, 'basic');
  console.log(`[api-tests] sweeper removed ${leftovers.length} booking(s) tagged ${runTag()}`);
  await context.dispose();
}
