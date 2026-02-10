import { describe, expect, it } from 'vitest';
import { runHealthCheck } from './health.js';

describe('runHealthCheck', () => {
  it('성공 상태를 Result 패턴으로 반환한다', () => {
    const result = runHealthCheck();

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.status).toBe('ok');
  });
});
