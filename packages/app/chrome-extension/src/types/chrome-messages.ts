/**
 * 확장 프로그램에서 사용하는 요청 메시지 타입이다.
 */
export type ExtensionRequestMessage =
  | { type: 'PING' }
  | { type: 'POPUP_READY' }
  | { type: 'CHECK_GEMINI_CONNECTION'; tabId?: number }
  | { type: 'GENERATE_IMAGE'; prompt: string }
  | { type: 'DOWNLOAD_IMAGE'; url: string; filename: string };

/**
 * 확장 프로그램에서 사용하는 응답 메시지 타입이다.
 */
export type ExtensionResponseMessage =
  | { type: 'PONG'; isGeminiTab: boolean }
  | { type: 'GEMINI_CONNECTION_STATUS'; connected: boolean; tabId?: number }
  | { type: 'IMAGE_GENERATION_TRIGGERED'; accepted: boolean }
  | { type: 'DOWNLOAD_COMPLETE'; downloadId: number }
  | { type: 'ERROR'; message: string };

/**
 * 백그라운드에서 콘텐츠 스크립트로 전달하는 명령 메시지 타입이다.
 */
export type ContentScriptCommandMessage = {
  type: 'RUN_IMAGE_GENERATION';
  prompt: string;
  options?: {
    systemPrompt?: string;
    referenceImages?: string[];
  };
};

/**
 * Gemini 앱 URL인지 확인한다.
 */
export function isGeminiAppUrl(url: string): boolean {
  return /^https:\/\/gemini\.google\.com\/app(\/|$)/.test(url);
}

/**
 * 연결 상태에 대응하는 한국어 라벨을 반환한다.
 */
export function getConnectionStatusLabel(connected: boolean): string {
  return connected ? 'Gemini 연결됨' : 'Gemini 연결 안됨';
}

/**
 * 팝업 준비 완료 메시지를 생성한다.
 */
export function createPopupReadyMessage(): ExtensionRequestMessage {
  return { type: 'POPUP_READY' };
}

/**
 * 이미지 생성 요청 메시지를 생성한다.
 */
export function createGenerateImageMessage(prompt: string): ExtensionRequestMessage {
  return { type: 'GENERATE_IMAGE', prompt };
}

/**
 * 런타임 요청 메시지의 형태를 검사한다.
 */
export function isExtensionRequestMessage(value: unknown): value is ExtensionRequestMessage {
  if (typeof value !== 'object' || value === null || !('type' in value)) {
    return false;
  }

  const message = value as { type: string; prompt?: unknown; tabId?: unknown; url?: unknown; filename?: unknown };

  switch (message.type) {
    case 'PING':
    case 'POPUP_READY':
      return true;
    case 'CHECK_GEMINI_CONNECTION':
      return message.tabId === undefined || typeof message.tabId === 'number';
    case 'GENERATE_IMAGE':
      return typeof message.prompt === 'string';
    case 'DOWNLOAD_IMAGE':
      return typeof message.url === 'string' && typeof message.filename === 'string';
    default:
      return false;
  }
}
