import { afterEach, describe, expect, it } from 'vitest';

import { createApp } from '../server.js';

describe('healthRoutes', () => {
  let app: Awaited<ReturnType<typeof createApp>> | null = null;

  afterEach(async () => {
    if (app) {
      await app.close();
      app = null;
    }
  });

  it('GET /health에서 상태와 타임스탬프를 반환한다', async () => {
    app = await createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
    });
  });
});
