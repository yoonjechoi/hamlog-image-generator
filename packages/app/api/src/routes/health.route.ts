import type { FastifyPluginAsync } from 'fastify';

import { runHealthCheck } from '../lib/health.js';

/**
 * 헬스 체크 응답 데이터.
 */
export interface HealthResponse {
  status: 'ok';
  timestamp: string;
}

/**
 * 헬스 체크 실패 응답 데이터.
 */
export interface HealthErrorResponse {
  status: 'error';
  message: string;
}

/**
 * 헬스 체크 라우트를 등록한다.
 */
export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Reply: HealthResponse | HealthErrorResponse }>(
    '/health',
    async (_request, reply) => {
      const healthResult = runHealthCheck();

      if (!healthResult.success) {
        return reply.status(503).send({
          status: 'error',
          message: healthResult.error.message,
        });
      }

      return {
        status: healthResult.data.status,
        timestamp: new Date().toISOString(),
      };
    },
  );
};
