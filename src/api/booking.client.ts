import type { APIRequestContext, APIResponse } from '@playwright/test';

import { config } from '../config';
import { buildBooking } from '../data/booking.factory';
import { CreatedBookingSchema, type Booking, type CreatedBooking } from '../schemas/booking.schema';

export type Authorization = { token: string } | 'basic' | 'none';

export interface BookingFilters {
  firstname?: string;
  lastname?: string;
  checkin?: string;
  checkout?: string;
}

const basicCredentials = () =>
  `Basic ${Buffer.from(`${config.admin.username}:${config.admin.password}`).toString('base64')}`;

const authHeaders = (authorization: Authorization): Record<string, string> => {
  if (authorization === 'none') return {};
  if (authorization === 'basic') return { Authorization: basicCredentials() };
  return { Cookie: `token=${authorization.token}` };
};

export class BookingClient {
  private readonly created = new Set<number>();

  constructor(private readonly request: APIRequestContext) {}

  async create(booking: unknown, headers: Record<string, string> = {}): Promise<APIResponse> {
    const response = await this.request.post('/booking', { data: booking, headers });
    const id = await response
      .json()
      .then(body => body?.bookingid)
      .catch(() => undefined);
    if (typeof id === 'number') this.created.add(id);
    return response;
  }

  async seed(overrides: Partial<Booking> = {}): Promise<CreatedBooking> {
    const response = await this.create(buildBooking(overrides));
    if (response.status() !== 200) throw new Error(`Could not seed a booking: ${response.status()}`);
    return CreatedBookingSchema.parse(await response.json());
  }

  get(id: number, headers: Record<string, string> = {}): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`, { headers });
  }

  list(filters: BookingFilters = {}): Promise<APIResponse> {
    return this.request.get('/booking', { params: { ...filters } });
  }

  update(id: number, booking: unknown, authorization: Authorization): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data: booking, headers: authHeaders(authorization) });
  }

  patch(id: number, changes: unknown, authorization: Authorization): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, { data: changes, headers: authHeaders(authorization) });
  }

  delete(id: number, authorization: Authorization): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: authHeaders(authorization) });
  }

  async deleteCreated(): Promise<void> {
    for (const id of this.created) {
      await this.delete(id, 'basic');
    }
    this.created.clear();
  }
}
