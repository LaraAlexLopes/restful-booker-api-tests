import type { APIRequestContext, APIResponse } from '@playwright/test';

import { config } from '../config';

export interface Credentials {
  username: string;
  password: string;
}

export class AuthClient {
  constructor(private readonly request: APIRequestContext) {}

  createToken(credentials: Partial<Credentials> = config.admin): Promise<APIResponse> {
    return this.request.post('/auth', { data: credentials });
  }

  async adminToken(): Promise<string> {
    const response = await this.createToken();
    const body = await response.json();
    if (!body.token) throw new Error(`Could not create an admin token: ${JSON.stringify(body)}`);
    return body.token;
  }
}
