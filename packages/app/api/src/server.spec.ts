import { afterEach, describe, expect, it } from 'vitest';

import { createApp } from './server.js';

describe('createApp', () => {
  let app: Awaited<ReturnType<typeof createApp>> | null = null;

  afterEach(async () => {
    if (app) {
      await app.close();
      app = null;
    }
  });

  it('Fastify 인스턴스를 생성하고 기본 라우트를 응답한다', async () => {
    app = await createApp();

    const healthResponse = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(healthResponse.statusCode).toBe(200);
    expect(healthResponse.json()).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
    });
  });
});
