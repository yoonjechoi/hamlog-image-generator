import cors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';

import { healthRoutes } from './routes/health.route.js';
import { imageRoutes } from './routes/images.route.js';

/**
 * Fastify 애플리케이션 인스턴스를 생성한다.
 * @returns 라우트가 등록된 Fastify 인스턴스
 */
export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify();

  await app.register(cors, {
    origin: true,
  });
  await app.register(healthRoutes);
  await app.register(imageRoutes);

  return app;
}
