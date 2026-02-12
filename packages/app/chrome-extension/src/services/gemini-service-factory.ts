/**
 * @fileoverview Factory for creating GeminiChatDomService instances in content script environment.
 *
 * Provides dependency injection of ChromeMessageSender as the messageSender parameter,
 * with proper type adaptation from ChromeMessage to the MessageSender interface.
 */

import { GeminiChatDomService } from '@hamlog/gemini-client';
import { ChromeMessageSender, type ChromeMessage } from './chrome-message-sender.js';

/**
 * Creates a GeminiChatDomService instance with injected dependencies.
 *
 * This factory function instantiates GeminiChatDomService with:
 * - The provided document and window objects
 * - A ChromeMessageSender instance wrapped to match the MessageSender type signature
 *
 * The wrapper adapts ChromeMessageSender.sendMessage (which expects ChromeMessage)
 * to the MessageSender interface (which expects unknown), enabling type-safe
 * inter-script communication via chrome.runtime.sendMessage.
 *
 * @param document - The DOM document object from the content script environment
 * @param window - The window object from the content script environment
 * @returns A fully initialized GeminiChatDomService instance ready for use
 *
 * @example
 * ```typescript
 * const service = createGeminiService(document, window);
 * const result = await service.startNewChat();
 * ```
 */
export function createGeminiService(
  document: Document,
  window: Window
): GeminiChatDomService {
  const sender = new ChromeMessageSender();

  const messageSender = (message: unknown): Promise<unknown> => {
    return sender.sendMessage(message as ChromeMessage);
  };

  return new GeminiChatDomService(document, window, messageSender);
}
