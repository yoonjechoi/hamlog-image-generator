import { afterEach, describe, expect, it } from 'vitest';

import { createApp } from '../server.js';

describe('imageRoutes', () => {
  let app: Awaited<ReturnType<typeof createApp>> | null = null;

  afterEach(async () => {
    if (app) {
      await app.close();
      app = null;
    }
  });

  it('POST /api/images/generate가 스텁 생성 결과를 반환한다', async () => {
    app = await createApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/images/generate',
      payload: {
        prompt: '산 정상의 일출',
        style: 'photorealistic',
      },
    });

    const body = response.json();
    expect(response.statusCode).toBe(202);
    expect(body.result.success).toBe(true);
    if (!body.result.success) {
      throw new Error('성공 Result가 필요합니다.');
    }

    expect(body.result.data).toEqual({
      id: expect.any(String),
      prompt: '산 정상의 일출',
      style: 'photorealistic',
      status: 'queued',
      url: null,
      createdAt: expect.any(String),
    });
  });

  it('GET /api/images/:id가 스텁 이미지 데이터를 반환한다', async () => {
    app = await createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/images/image-123',
    });

    const body = response.json();
    expect(response.statusCode).toBe(200);
    expect(body.success).toBe(true);
    if (!body.success) {
      throw new Error('성공 Result가 필요합니다.');
    }

    expect(body.data).toEqual({
      id: 'image-123',
      prompt: 'stub prompt',
      style: 'default',
      status: 'completed',
      url: 'https://example.com/images/image-123.png',
      createdAt: expect.any(String),
    });
  });
});
