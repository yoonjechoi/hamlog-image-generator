import { describe, expect, it } from 'vitest';
import { PlaceholderGeminiClient } from './client.js';

describe('PlaceholderGeminiClient', () => {
  it('구현 전 상태에서 실패 Result를 반환한다', async () => {
    const client = new PlaceholderGeminiClient();

    const result = await client.generateText({ prompt: 'hello' });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.message).toContain('Gemini client is not configured yet');
  });
});
