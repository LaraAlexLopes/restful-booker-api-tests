import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected a CCYY-MM-DD date');

export const BookingSchema = z.strictObject({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number().int(),
  depositpaid: z.boolean(),
  bookingdates: z.strictObject({ checkin: isoDate, checkout: isoDate }),
  additionalneeds: z.string().optional(),
});

export const CreatedBookingSchema = z.strictObject({
  bookingid: z.number().int().positive(),
  booking: BookingSchema,
});

export const BookingIdsSchema = z.array(z.strictObject({ bookingid: z.number().int().positive() }));

export const TokenSchema = z.strictObject({ token: z.string().min(1) });

export type Booking = z.infer<typeof BookingSchema>;
export type CreatedBooking = z.infer<typeof CreatedBookingSchema>;
