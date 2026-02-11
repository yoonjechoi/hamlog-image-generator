// ─── Legacy API Client (placeholder) ───
export {
  PlaceholderGeminiClient,
  type GeminiClient,
  type GeminiGenerateTextParams,
  type GeminiGenerateTextResponse,
} from './lib/client.js';

// ─── Gemini Chat Service Interface ───
export type { IGeminiChatService } from './lib/gemini-chat-service.interface.js';
export {
  GeminiChatDomService,
  type MessageSender,
} from './lib/gemini-chat-dom.service.js';

// ─── Types ───
export type {
  ChatMode,
  DownloadOptions,
  GeminiError,
  GeminiErrorCode,
  GeminiLocale,
  GeminiTool,
  GenerateOptions,
  GeneratedImage,
  GenerationState,
  ModelResponse,
  UploadedFile,
} from './lib/types/gemini-chat.types.js';

// ─── Selectors & i18n Constants ───
export {
  ARIA_LABELS,
  CONVERSATION_URL_PATTERN,
  ERROR_PATTERNS,
  MODE_LABELS,
  SELECTORS,
  TOOL_LABELS,
} from './lib/types/selectors.js';

// ─── Error Helpers ───
export {
  elementNotFound,
  geminiError,
  invalidState,
  policyBlocked,
  timeout,
} from './lib/types/errors.js';
