/**
 * @fileoverview Chrome extension message sender implementation.
 *
 * Wraps chrome.runtime.sendMessage to provide a type-safe interface
 * for sending messages from content script to background script.
 */

/**
 * Message structure for chrome.runtime.sendMessage.
 */
export interface ChromeMessage {
  /** Message type identifier */
  readonly type: string;
  /** Target URL for the message */
  readonly url: string;
  /** Optional filename for download operations */
  readonly filename?: string;
}

/**
 * Sends messages from content script to background script via chrome.runtime.sendMessage.
 *
 * This class wraps the Chrome extension messaging API to provide a clean,
 * testable interface for inter-script communication.
 *
 * @example
 * ```typescript
 * const sender = new ChromeMessageSender();
 * await sender.sendMessage({
 *   type: 'DOWNLOAD_IMAGE',
 *   url: 'https://example.com/image.png',
 *   filename: 'my-image.png'
 * });
 * ```
 */
export class ChromeMessageSender {
  /**
   * Sends a message to the background script.
   *
   * @param message - The message object containing type, url, and optional filename
   * @returns A promise that resolves with the response from the background script
   * @throws If chrome.runtime.sendMessage fails or is not available
   */
  public async sendMessage(message: ChromeMessage): Promise<unknown> {
    return chrome.runtime.sendMessage(message);
  }
}
