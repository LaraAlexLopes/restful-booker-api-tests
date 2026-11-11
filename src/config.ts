export const config = {
  admin: {
    username: process.env.ADMIN_USERNAME ?? 'admin',
    password: process.env.ADMIN_PASSWORD ?? 'password123',
  },
};

export const runId = (): string => {
  process.env.TEST_RUN_ID ??= Date.now().toString(36);
  return process.env.TEST_RUN_ID;
};

export const runTag = (): string => `Qa${runId()}`;
