import { useEffect, useState } from 'react';
import { createPopupReadyMessage, type ExtensionResponseMessage } from '../../types/chrome-messages.js';

/**
 * Gemini 연결 상태 표시를 위한 훅 상태 타입이다.
 */
export interface GeminiConnectionState {
  connected: boolean;
  checking: boolean;
}

/**
 * 팝업 준비 메시지를 전송하고 Gemini 연결 상태를 조회한다.
 */
export async function checkGeminiConnection(): Promise<Pick<GeminiConnectionState, 'connected'>> {
  try {
    const response = (await chrome.runtime.sendMessage(createPopupReadyMessage())) as ExtensionResponseMessage | undefined;

    if (response?.type === 'GEMINI_CONNECTION_STATUS') {
      return { connected: response.connected };
    }

    return { connected: false };
  } catch {
    return { connected: false };
  }
}

/**
 * 마운트 시 Gemini 연결 상태를 조회해 UI 상태를 관리한다.
 */
export function useGeminiConnection(): GeminiConnectionState {
  const [state, setState] = useState<GeminiConnectionState>({ connected: false, checking: true });

  useEffect(() => {
    const controller = new AbortController();

    void checkGeminiConnection().then(({ connected }) => {
      if (controller.signal.aborted) {
        return;
      }

      setState({ connected, checking: false });
    });

    return () => {
      controller.abort();
    };
  }, []);

  return state;
}
