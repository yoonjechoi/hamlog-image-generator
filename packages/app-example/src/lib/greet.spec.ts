import { describe, it, expect } from 'vitest';
import { greet } from './greet.js';

describe('greet', () => {
  it('should return greeting message with name', () => {
    const result = greet('World');

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toBe('Hello, World!');
  });
});
