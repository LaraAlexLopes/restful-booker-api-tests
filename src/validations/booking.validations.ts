import { expect, type APIResponse } from '@playwright/test';

import type { BookingClient } from '../api/booking.client';
import {
  BookingIdsSchema,
  BookingSchema,
  CreatedBookingSchema,
  TokenSchema,
  type Booking,
} from '../schemas/booking.schema';

export const validateStatus = async (response: APIResponse, status: number): Promise<void> => {
  expect(response.status(), `${response.url()} responded ${await response.text()}`).toBe(status);
};

export const validateTokenIssued = async (response: APIResponse): Promise<string> => {
  await validateStatus(response, 200);
  return TokenSchema.parse(await response.json()).token;
};

export const validateBookingStored = async (bookings: BookingClient, id: number, expected: Booking): Promise<void> => {
  const response = await bookings.get(id);
  await validateStatus(response, 200);
  expect(BookingSchema.parse(await response.json())).toEqual(expected);
};

export const validateBookingCreated = async (
  bookings: BookingClient,
  response: APIResponse,
  expected: Booking,
): Promise<number> => {
  await validateStatus(response, 200);
  const created = CreatedBookingSchema.parse(await response.json());
  expect(created.booking).toEqual(expected);
  await validateBookingStored(bookings, created.bookingid, expected);
  return created.bookingid;
};

export const validateBookingUpdated = async (
  bookings: BookingClient,
  response: APIResponse,
  id: number,
  expected: Booking,
): Promise<void> => {
  await validateStatus(response, 200);
  expect(BookingSchema.parse(await response.json())).toEqual(expected);
  await validateBookingStored(bookings, id, expected);
};

export const validateForbidden = async (response: APIResponse): Promise<void> => {
  await validateStatus(response, 403);
  expect(await response.text()).toBe('Forbidden');
};

export const validateBookingUnchanged = validateBookingStored;

export const validateBookingNotFound = async (bookings: BookingClient, id: number): Promise<void> => {
  const response = await bookings.get(id);
  await validateStatus(response, 404);
  expect(await response.text()).toBe('Not Found');
};

export const validateBookingDeleted = async (
  bookings: BookingClient,
  response: APIResponse,
  id: number,
): Promise<void> => {
  await validateStatus(response, 201);
  expect(await response.text()).toBe('Created');
  await validateBookingNotFound(bookings, id);
};

const listedIds = async (response: APIResponse): Promise<number[]> => {
  await validateStatus(response, 200);
  return BookingIdsSchema.parse(await response.json()).map(({ bookingid }) => bookingid);
};

export const validateOnlyBookingsListed = async (response: APIResponse, ids: number[]): Promise<void> => {
  expect((await listedIds(response)).sort()).toEqual([...ids].sort());
};

export const validateBookingListed = async (response: APIResponse, id: number): Promise<void> => {
  expect(await listedIds(response)).toContain(id);
};

export const validateBookingNotListed = async (response: APIResponse, id: number): Promise<void> => {
  expect(await listedIds(response)).not.toContain(id);
};
