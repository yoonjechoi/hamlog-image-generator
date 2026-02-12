import type {
  ContentScriptCommandMessage,
  ExtensionResponseMessage,
} from './types/chrome-messages.js';
import { createGeminiService } from './services/gemini-service-factory.js';

const geminiService = createGeminiService(document, window);

/**
 * Gemini 페이지에서 콘텐츠 스크립트를 초기화한다.
 */
export function initContentScript(): MutationObserver | null {
  if (typeof document === 'undefined' || !document.body) {
    return null;
  }

  console.info('[hamlog-extension] 콘텐츠 스크립트 초기화');

  const observer = new MutationObserver(() => {
    // Gemini 페이지 변경 감지 지점 (추후 기능 연결 예정)
  });

  observer.observe(document.body, { childList: true, subtree: true });

  chrome.runtime.onMessage.addListener((message: ContentScriptCommandMessage, _sender, sendResponse) => {
    if (message.type === 'RUN_IMAGE_GENERATION') {
      console.info('[hamlog-extension] 이미지 생성 명령 수신', message.prompt);
      
      void (async () => {
        try {
          // 1. Select Imagen 3 tool
          console.info('[hamlog-extension] Imagen 3 도구 선택 중...');
          const toolResult = await geminiService.selectTool('image_generation');
          if (!toolResult.success) {
            console.error('[hamlog-extension] 도구 선택 실패', toolResult.error);
            const response: ExtensionResponseMessage = {
              type: 'ERROR',
              message: toolResult.error.message,
            };
            sendResponse(response);
            return;
          }

          // 2. Generate image
          console.info('[hamlog-extension] 이미지 생성 중...');
          const generateResult = await geminiService.generate(message.prompt);
          if (!generateResult.success) {
            console.error('[hamlog-extension] 이미지 생성 실패', generateResult.error);
            const response: ExtensionResponseMessage = {
              type: 'ERROR',
              message: generateResult.error.message,
            };
            sendResponse(response);
            return;
          }

          // 3. Download image
          console.info('[hamlog-extension] 이미지 다운로드 중...');
          const images = generateResult.data.images;
          if (images.length === 0) {
            console.error('[hamlog-extension] 생성된 이미지 없음');
            const response: ExtensionResponseMessage = {
              type: 'ERROR',
              message: '생성된 이미지가 없습니다.',
            };
            sendResponse(response);
            return;
          }

          const downloadResult = await geminiService.downloadImage(images[0]);
          if (!downloadResult.success) {
            console.error('[hamlog-extension] 이미지 다운로드 실패', downloadResult.error);
            const response: ExtensionResponseMessage = {
              type: 'ERROR',
              message: downloadResult.error.message,
            };
            sendResponse(response);
            return;
          }

          console.info('[hamlog-extension] 이미지 생성 및 다운로드 완료');
          const response: ExtensionResponseMessage = {
            type: 'IMAGE_GENERATION_TRIGGERED',
            accepted: true,
          };
          sendResponse(response);
        } catch (error) {
          console.error('[hamlog-extension] 예상치 못한 오류', error);
          const response: ExtensionResponseMessage = {
            type: 'ERROR',
            message: error instanceof Error ? error.message : '알 수 없는 오류',
          };
          sendResponse(response);
        }
      })();
      
      return true;
    }

    return false;
  });

  return observer;
}

void initContentScript();
