import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChromeMessageSender } from './chrome-message-sender.js';

describe('ChromeMessageSender', () => {
  let mockChrome: any;

  beforeEach(() => {
    // Mock chrome.runtime.sendMessage
    mockChrome = {
      runtime: {
        sendMessage: vi.fn(),
      },
    };
    // Inject mock into global scope
    (global as any).chrome = mockChrome;
  });

  describe('sendMessage', () => {
    it('should send a message via chrome.runtime.sendMessage', async () => {
      const sender = new ChromeMessageSender();
      const message = {
        type: 'DOWNLOAD_IMAGE',
        url: 'https://example.com/image.png',
      };

      mockChrome.runtime.sendMessage.mockResolvedValue({ success: true });

      await sender.sendMessage(message);

      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith(message);
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledTimes(1);
    });

    it('should send a message with optional filename', async () => {
      const sender = new ChromeMessageSender();
      const message = {
        type: 'DOWNLOAD_IMAGE',
        url: 'https://example.com/image.png',
        filename: 'custom-name.png',
      };

      mockChrome.runtime.sendMessage.mockResolvedValue({ success: true });

      await sender.sendMessage(message);

      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith(message);
    });

    it('should handle chrome.runtime.sendMessage errors', async () => {
      const sender = new ChromeMessageSender();
      const message = {
        type: 'DOWNLOAD_IMAGE',
        url: 'https://example.com/image.png',
      };

      const error = new Error('Chrome extension error');
      mockChrome.runtime.sendMessage.mockRejectedValue(error);

      await expect(sender.sendMessage(message)).rejects.toThrow('Chrome extension error');
    });

    it('should return the response from chrome.runtime.sendMessage', async () => {
      const sender = new ChromeMessageSender();
      const message = {
        type: 'DOWNLOAD_IMAGE',
        url: 'https://example.com/image.png',
      };

      const expectedResponse = { success: true, data: 'test' };
      mockChrome.runtime.sendMessage.mockResolvedValue(expectedResponse);

      const result = await sender.sendMessage(message);

      expect(result).toEqual(expectedResponse);
    });
  });
});
