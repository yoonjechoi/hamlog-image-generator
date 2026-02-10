import type {
  ContentScriptCommandMessage,
  ExtensionRequestMessage,
  ExtensionResponseMessage,
} from './types/chrome-messages.js';
import { isGeminiAppUrl } from './types/chrome-messages.js';

export type {
  ContentScriptCommandMessage,
  ExtensionRequestMessage,
  ExtensionResponseMessage,
} from './types/chrome-messages.js';

/**
 * 탭 URL을 기준으로 Gemini 연결 여부를 확인한다.
 */
export function isGeminiConnectedFromTab(tab?: chrome.tabs.Tab): boolean {
  return typeof tab?.url === 'string' && isGeminiAppUrl(tab.url);
}

/**
 * 활성 탭을 조회한다.
 */
export async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

/**
 * 요청 메시지를 처리해 응답 메시지를 반환한다.
 */
export async function handleBackgroundMessage(
  message: ExtensionRequestMessage,
  sender: chrome.runtime.MessageSender
): Promise<ExtensionResponseMessage> {
  switch (message.type) {
    case 'PING': {
      return {
        type: 'PONG',
        isGeminiTab: isGeminiConnectedFromTab(sender.tab),
      };
    }

    case 'POPUP_READY':
    case 'CHECK_GEMINI_CONNECTION': {
      const tabId = 'tabId' in message ? message.tabId : undefined;
      const targetTab =
        typeof tabId === 'number' ? await chrome.tabs.get(tabId) : await getActiveTab();

      return {
        type: 'GEMINI_CONNECTION_STATUS',
        connected: isGeminiConnectedFromTab(targetTab),
        tabId: targetTab?.id,
      };
    }

    case 'GENERATE_IMAGE': {
      const sourceTab = sender.tab ?? (await getActiveTab());

      if (typeof sourceTab?.id !== 'number') {
        return { type: 'ERROR', message: '활성 탭을 찾을 수 없습니다.' };
      }

      const command: ContentScriptCommandMessage = {
        type: 'RUN_IMAGE_GENERATION',
        prompt: message.prompt,
      };

      await chrome.tabs.sendMessage(sourceTab.id, command);

      return { type: 'IMAGE_GENERATION_TRIGGERED', accepted: true };
    }

    default:
      return { type: 'ERROR', message: '지원하지 않는 메시지 타입입니다.' };
  }
}

chrome.runtime.onMessage.addListener((message: ExtensionRequestMessage, sender, sendResponse) => {
  void handleBackgroundMessage(message, sender)
    .then((response) => {
      sendResponse(response);
    })
    .catch((error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      const response: ExtensionResponseMessage = { type: 'ERROR', message: errorMessage };
      sendResponse(response);
    });

  return true;
});
