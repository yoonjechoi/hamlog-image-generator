// ─── Legacy API Client (placeholder) ───
export {
  PlaceholderGeminiClient,
  type GeminiClient,
  type GeminiGenerateTextParams,
  type GeminiGenerateTextResponse,
} from './lib/client.js';

// ─── Gemini Chat Service Interface ───
export type { IGeminiChatService } from './lib/gemini-chat-service.interface.js';

// ─── Types ───
export type {
  ChatMode,
  DownloadOptions,
  GeminiError,
  GeminiErrorCode,
  GeminiLocale,
  GeminiTool,
  GeneratedImage,
  GenerationState,
  ModelResponse,
  UploadedFile,
  WaitOptions,
} from './lib/types/gemini-chat.types.js';

// ─── Selectors & i18n Constants ───
export {
  ARIA_LABELS,
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
