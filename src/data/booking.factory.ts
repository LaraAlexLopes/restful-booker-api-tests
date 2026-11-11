import { faker } from '@faker-js/faker';

import { runTag } from '../config';
import type { Booking } from '../schemas/booking.schema';

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

export const buildStay = (
  checkinInDays = faker.number.int({ min: 30, max: 365 }),
  nights = faker.number.int({ min: 1, max: 14 }),
) => {
  const checkin = addDays(new Date(), checkinInDays);
  return { checkin: isoDate(checkin), checkout: isoDate(addDays(checkin, nights)) };
};

export const uniqueFirstName = (): string =>
  `${faker.person.firstName()}${faker.string.alpha({ length: 6, casing: 'lower' })}`;

export const buildBooking = (overrides: Partial<Booking> = {}): Booking => ({
  firstname: faker.person.firstName(),
  lastname: runTag(),
  totalprice: faker.number.int({ min: 50, max: 5000 }),
  depositpaid: faker.datatype.boolean(),
  bookingdates: buildStay(),
  additionalneeds: faker.helpers.arrayElement(['Breakfast', 'Late checkout', 'Airport transfer', 'Extra bed']),
  ...overrides,
});
