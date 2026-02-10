export { extensionDisplayName } from './lib/extension.js';
export {
  createGenerateImageMessage,
  createPopupReadyMessage,
  getConnectionStatusLabel,
  isExtensionRequestMessage,
  isGeminiAppUrl,
} from './types/chrome-messages.js';
export type {
  ContentScriptCommandMessage,
  ExtensionRequestMessage,
  ExtensionResponseMessage,
} from './types/chrome-messages.js';
