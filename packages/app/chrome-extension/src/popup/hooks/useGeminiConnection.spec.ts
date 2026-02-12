// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkGeminiConnection } from './useGeminiConnection.js';

describe('checkGeminiConnection', () => {
  type ChromeGlobal = {
    runtime: {
      sendMessage: ReturnType<typeof vi.fn>;
    };
  };

  let sendMessageMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sendMessageMock = vi.fn();

    (globalThis as typeof globalThis & { chrome: ChromeGlobal }).chrome = {
      runtime: {
        sendMessage: sendMessageMock,
      },
    } as ChromeGlobal;
  });

  it('returns connected true when chrome responds with GEMINI_CONNECTION_STATUS true', async () => {
    sendMessageMock.mockResolvedValue({
      type: 'GEMINI_CONNECTION_STATUS',
      connected: true,
    });

    await expect(checkGeminiConnection()).resolves.toEqual({ connected: true });
  });

  it('returns connected false when chrome responds with error', async () => {
    sendMessageMock.mockResolvedValue({
      type: 'ERROR',
      message: 'failed',
    });

    await expect(checkGeminiConnection()).resolves.toEqual({ connected: false });
  });

  it('returns connected false when no response is provided', async () => {
    sendMessageMock.mockResolvedValue(undefined);

    await expect(checkGeminiConnection()).resolves.toEqual({ connected: false });
  });
});
