import {
  createGenerateImageMessage,
  createPopupReadyMessage,
  getConnectionStatusLabel,
} from '../types/chrome-messages.js';
import type { ExtensionResponseMessage } from '../types/chrome-messages.js';

/**
 * 팝업 상태 문구를 화면에 반영한다.
 */
export function updateStatusText(target: HTMLElement, connected: boolean): void {
  target.textContent = getConnectionStatusLabel(connected);
}

/**
 * 백그라운드로 메시지를 전송한다.
 */
export async function sendRuntimeMessage(message: unknown): Promise<ExtensionResponseMessage> {
  return new Promise<ExtensionResponseMessage>((resolve) => {
    chrome.runtime.sendMessage(message, (response: ExtensionResponseMessage | undefined) => {
      if (!response) {
        resolve({ type: 'ERROR', message: '응답을 받지 못했습니다.' });
        return;
      }

      resolve(response);
    });
  });
}

/**
 * 팝업 이벤트를 초기화한다.
 */
export function initPopup(): void {
  const statusElement = document.querySelector<HTMLElement>('#status');
  const generateButton = document.querySelector<HTMLButtonElement>('#generate-button');

  if (!statusElement || !generateButton) {
    return;
  }

  void sendRuntimeMessage(createPopupReadyMessage()).then((response) => {
    if (response.type === 'GEMINI_CONNECTION_STATUS') {
      updateStatusText(statusElement, response.connected);
      generateButton.disabled = !response.connected;
      return;
    }

    updateStatusText(statusElement, false);
    generateButton.disabled = true;
  });

  generateButton.addEventListener('click', () => {
    generateButton.disabled = true;

    void sendRuntimeMessage(createGenerateImageMessage('Gemini 이미지 생성 요청')).then((response) => {
      if (response.type === 'IMAGE_GENERATION_TRIGGERED' && response.accepted) {
        statusElement.textContent = '이미지 생성 요청을 전송했습니다.';
      } else {
        statusElement.textContent = '이미지 생성 요청 전송에 실패했습니다.';
      }

      generateButton.disabled = false;
    });
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initPopup();
  });
}
