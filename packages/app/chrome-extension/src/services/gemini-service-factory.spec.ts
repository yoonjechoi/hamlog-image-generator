import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GeminiChatDomService } from '@hamlog/gemini-client';
import { createGeminiService } from './gemini-service-factory.js';
import { ChromeMessageSender } from './chrome-message-sender.js';

describe('createGeminiService', () => {
  let mockDocument: Document;
  let mockWindow: Window;
  let mockChrome: any;

  beforeEach(() => {
    // Mock document and window
    mockDocument = {
      querySelector: vi.fn(),
    } as any;

    mockWindow = {
      location: { href: 'https://gemini.google.com' },
    } as any;

    // Mock chrome.runtime.sendMessage
    mockChrome = {
      runtime: {
        sendMessage: vi.fn(),
      },
    };
    (global as any).chrome = mockChrome;
  });

  it('should return a GeminiChatDomService instance', () => {
    const service = createGeminiService(mockDocument, mockWindow);

    expect(service).toBeInstanceOf(GeminiChatDomService);
  });

  it('should inject document and window into the service', () => {
    const service = createGeminiService(mockDocument, mockWindow);

    // Access private properties via any cast for testing
    const serviceAny = service as any;
    expect(serviceAny.document).toBe(mockDocument);
    expect(serviceAny.window).toBe(mockWindow);
  });

  it('should inject a messageSender function into the service', () => {
    const service = createGeminiService(mockDocument, mockWindow);

    // Access private properties via any cast for testing
    const serviceAny = service as any;
    expect(serviceAny.messageSender).toBeDefined();
    expect(typeof serviceAny.messageSender).toBe('function');
  });

  it('should wrap ChromeMessageSender.sendMessage to match MessageSender type signature', async () => {
    const service = createGeminiService(mockDocument, mockWindow);
    const serviceAny = service as any;

    const mockResponse = { success: true };
    mockChrome.runtime.sendMessage.mockResolvedValue(mockResponse);

    // Call the injected messageSender with unknown type
    const message = {
      type: 'DOWNLOAD_IMAGE',
      url: 'https://example.com/image.png',
    };

    const result = await serviceAny.messageSender(message);

    expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith(message);
    expect(result).toEqual(mockResponse);
  });
});
