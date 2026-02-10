import type {
  ContentScriptCommandMessage,
  ExtensionResponseMessage,
} from './types/chrome-messages.js';

/**
 * Gemini 페이지에서 콘텐츠 스크립트를 초기화한다.
 */
export function initContentScript(): MutationObserver | null {
  if (typeof document === 'undefined' || !document.body) {
    return null;
  }

  console.info('[hamlog-extension] 콘텐츠 스크립트 초기화');

  const observer = new MutationObserver((mutations) => {
    if (mutations.length > 0) {
      // Gemini 페이지 변경 감지 지점 (추후 기능 연결 예정)
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  chrome.runtime.onMessage.addListener((message: ContentScriptCommandMessage, _sender, sendResponse) => {
    if (message.type === 'RUN_IMAGE_GENERATION') {
      console.info('[hamlog-extension] 이미지 생성 명령 수신', message.prompt);
      const response: ExtensionResponseMessage = {
        type: 'IMAGE_GENERATION_TRIGGERED',
        accepted: true,
      };
      sendResponse(response);
      return true;
    }

    return false;
  });

  return observer;
}

void initContentScript();
