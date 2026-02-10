import { ok, type Result } from '@hamlog/core';

/**
 * API 상태 확인 응답 값.
 */
export interface ApiHealth {
  status: 'ok';
}

/**
 * Fastify API 스캐폴드의 기본 상태 확인 결과를 반환한다.
 * @returns 상태 확인 성공 Result
 */
export function runHealthCheck(): Result<ApiHealth, Error> {
  return ok({ status: 'ok' });
}
