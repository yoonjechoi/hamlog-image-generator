import { err, ok, type Result } from '@hamlog/core';
import type { FastifyPluginAsync } from 'fastify';

import type {
  ImageApiError,
  ImageData,
  ImageGenerateRequest,
  ImageGenerateResponse,
} from '../types/api.types.js';

/**
 * 기본 이미지 라우트를 등록한다.
 */
export const imageRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: ImageGenerateRequest; Reply: ImageGenerateResponse }>(
    '/api/images/generate',
    async (request, reply) => {
      const input = request.body;

      if (!input.prompt || input.prompt.trim().length === 0) {
        const invalidResult: Result<ImageData, ImageApiError> = err({
          code: 'INVALID_INPUT',
          message: 'prompt는 비어 있을 수 없습니다.',
        });
        return reply.status(400).send({ result: invalidResult });
      }

      const generatedImage: ImageData = {
        id: crypto.randomUUID(),
        prompt: input.prompt,
        style: input.style,
        status: 'queued',
        url: null,
        createdAt: new Date().toISOString(),
      };

      const successResult: Result<ImageData, ImageApiError> = ok(generatedImage);
      return reply.status(202).send({ result: successResult });
    },
  );

  app.get<{ Params: { id: string }; Reply: Result<ImageData, ImageApiError> }>(
    '/api/images/:id',
    async (request, reply) => {
      if (!request.params.id || request.params.id.trim().length === 0) {
        return reply.status(400).send(
          err({
            code: 'INVALID_INPUT',
            message: '이미지 ID가 필요합니다.',
          }),
        );
      }

      return reply.send(
        ok({
          id: request.params.id,
          prompt: 'stub prompt',
          style: 'default',
          status: 'completed',
          url: `https://example.com/images/${request.params.id}.png`,
          createdAt: new Date().toISOString(),
        }),
      );
    },
  );
};
