import { describe, it, expect, vi, beforeEach } from 'vitest';
import { downloadImage } from './download-service.js';

describe('downloadImage', () => {
  let mockChrome: any;

  beforeEach(() => {
    // Mock chrome.downloads.download
    mockChrome = {
      downloads: {
        download: vi.fn(),
      },
    };
    // Inject mock into global scope
    (global as any).chrome = mockChrome;
  });

  describe('successful download', () => {
    it('should return ok with downloadId on successful download', async () => {
      const downloadId = 12345;
      mockChrome.downloads.download.mockResolvedValue(downloadId);

      const result = await downloadImage('https://example.com/image.png', 'test-image.png');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(downloadId);
      }
    });

    it('should pass correct options to chrome.downloads.download', async () => {
      const url = 'https://example.com/image.png';
      const filename = 'test-image.png';
      const downloadId = 12345;
      mockChrome.downloads.download.mockResolvedValue(downloadId);

      await downloadImage(url, filename);

      expect(mockChrome.downloads.download).toHaveBeenCalledWith({
        url,
        filename,
        conflictAction: 'uniquify',
      });
    });

    it('should set conflictAction to uniquify', async () => {
      mockChrome.downloads.download.mockResolvedValue(999);

      await downloadImage('https://example.com/image.png', 'image.png');

      const callArgs = mockChrome.downloads.download.mock.calls[0][0];
      expect(callArgs.conflictAction).toBe('uniquify');
    });
  });

  describe('download failure', () => {
    it('should return err with error message on download failure', async () => {
      const errorMessage = 'Download failed: Network error';
      mockChrome.downloads.download.mockRejectedValue(new Error(errorMessage));

      const result = await downloadImage('https://example.com/image.png', 'test-image.png');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(errorMessage);
      }
    });

    it('should handle chrome.downloads.download errors gracefully', async () => {
      const error = new Error('Chrome API error');
      mockChrome.downloads.download.mockRejectedValue(error);

      const result = await downloadImage('https://example.com/image.png', 'test-image.png');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Chrome API error');
      }
    });
  });
});
