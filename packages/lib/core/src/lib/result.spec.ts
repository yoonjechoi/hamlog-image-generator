import { describe, it, expect } from 'vitest';
import { ok, err, type Result } from './result.js';

describe('Result', () => {
  it('ok() should return success result with data', () => {
    const result = ok(42);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toBe(42);
  });

  it('err() should return failure result with error', () => {
    const result = err(new Error('something went wrong'));

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.message).toBe('something went wrong');
  });

  it('should narrow types via discriminated union', () => {
    const result: Result<string, Error> = ok('hello');

    if (result.success) {
      expect(result.data).toBe('hello');
    } else {
      expect(result.error).toBeDefined();
    }
  });
});
