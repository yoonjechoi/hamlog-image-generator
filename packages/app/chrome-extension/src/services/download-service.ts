import { ok, err, type Result } from '@hamlog/core';

/**
 * Downloads an image using the Chrome downloads API.
 *
 * Wraps chrome.downloads.download to provide a Result-based interface
 * for downloading images with automatic filename conflict resolution.
 *
 * @param url - The URL of the image to download
 * @param filename - The desired filename for the downloaded image
 * @returns A promise that resolves to a Result containing the download ID on success,
 *          or an error message on failure
 *
 * @example
 * ```typescript
 * const result = await downloadImage('https://example.com/image.png', 'my-image.png');
 * if (result.isOk()) {
 *   console.log('Download started with ID:', result.unwrap());
 * } else {
 *   console.error('Download failed:', result.unwrapErr());
 * }
 * ```
 */
export async function downloadImage(
  url: string,
  filename: string,
): Promise<Result<number, string>> {
  try {
    const downloadId = await chrome.downloads.download({
      url,
      filename,
      conflictAction: 'uniquify',
    });
    return ok(downloadId);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return err(errorMessage);
  }
}
