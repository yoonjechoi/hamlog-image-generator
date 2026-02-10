/**
 * @fileoverview Gemini Chat 서비스 인터페이스.
 *
 * Gemini 웹 UI(gemini.google.com/app)의 모든 사용자 조작을
 * 프로그래밍 방식으로 추상화한 계약(contract).
 *
 * 이 인터페이스 하나로:
 * - 이미지 배치 생성 자동화
 * - 텍스트 대화 자동화
 * - Deep Research 자동화
 * - 비디오 생성 자동화
 * - 다중 턴 대화 오케스트레이션
 * 등을 구현할 수 있다.
 *
 * @example
 * ```typescript
 * // 이미지 배치 생성 (참조이미지 1회 업로드 + n개 프롬프트)
 * const chat = createGeminiChatService();
 * await chat.startNewChat();
 * await chat.uploadFiles(referenceImages);  // 1회만 호출
 * await chat.selectTool('image_generation'); // 1회만 호출
 *
 * for (const [i, prompt] of prompts.entries()) {
 *   await chat.sendPrompt(prompt);
 *   const response = await chat.waitForResponse();
 *   if (response.success) {
 *     for (const img of response.data.images) {
 *       await chat.downloadImage(img, {
 *         filename: `${String(i + 1).padStart(3, '0')}_${slug}.png`
 *       });
 *     }
 *   }
 * }
 *
 * const url = chat.getConversationUrl();
 * console.log(`대화 URL: ${url}`);
 * ```
 */

import type { Result } from '@hamlog/core';
import type {
  ChatMode,
  DownloadOptions,
  GeminiError,
  GeminiLocale,
  GeminiTool,
  GeneratedImage,
  GenerationState,
  ModelResponse,
  UploadedFile,
  WaitOptions,
} from './types/gemini-chat.types.js';

/**
 * Gemini Chat 서비스 인터페이스.
 *
 * Gemini 웹 앱의 모든 사용자 조작을 원자적 메서드로 추상화한다.
 * 각 메서드는 독립적이며, 자유롭게 조합하여 워크플로우를 구성할 수 있다.
 *
 * 모든 부작용 메서드는 `Result<T, GeminiError>`를 반환하며,
 * 예외를 throw하지 않는다.
 */
export interface IGeminiChatService {
  // ─────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────

  /**
   * 새 채팅을 시작한다.
   *
   * 현재 대화를 종료하고 빈 채팅 화면으로 이동한다.
   * 기존 도구 선택, 모드 설정은 초기화될 수 있다.
   */
  startNewChat(): Promise<Result<void, GeminiError>>;

  // ─────────────────────────────────────────
  // Input
  // ─────────────────────────────────────────

   /**
    * 프롬프트를 입력하고 전송한다.
    *
    * 텍스트를 composer에 입력 후 전송 버튼을 클릭한다.
    * 전송 직후 반환되며, 응답 완료를 기다리지 않는다.
    * 응답을 기다리려면 `waitForResponse()`를 호출한다.
    *
    * **배치 자동화 시**: 이전 응답 완료 직후 다음 프롬프트를 즉시 전송할 수 있다.
    * 프롬프트 간 쿨다운은 필요 없다.
    * (실험 결과: 10개 연속 전송에서 0건 실패 확인)
    *
    * @param text - 전송할 프롬프트 텍스트
    */
   sendPrompt(text: string): Promise<Result<void, GeminiError>>;

   /**
    * 파일을 업로드한다.
    *
    * 참조 이미지, 문서 등을 composer에 첨부한다.
    * 업로드 완료 후 미리보기 칩이 나타나면 반환된다.
    *
    * **배치 자동화 시**: 참조 이미지는 첫 번째 프롬프트에서 1회만 업로드하면 된다.
    * 이후 프롬프트에서는 "같은 캐릭터" 등 텍스트 참조만으로 충분하다.
    * (실험 결과: 10개 연속 프롬프트에서 1회 업로드로 일관성 유지 확인)
    *
    * **구현 참고**: DOM 구현체에서는 `upload-card-button` → `menuitem("파일 업로드")` →
    * `upload_file` 순서로 업로드한다. hidden `input[type="file"]` 직접 접근은 실패한다.
    *
    * @param files - 업로드할 File 객체 배열 (`multiple=true` 지원)
    */
   uploadFiles(files: File[]): Promise<Result<UploadedFile[], GeminiError>>;

  // ─────────────────────────────────────────
  // Tools
  // ─────────────────────────────────────────

   /**
    * 도구를 선택(활성화)한다.
    *
    * 도구 메뉴를 열고 해당 도구의 `menuitemcheckbox`를 클릭한다.
    * 활성화되면 composer에 선택 해제 칩이 나타난다.
    * 이미 활성화된 도구를 다시 선택하면 no-op.
    *
    * **배치 자동화 시**: 대화 시작 시 1회만 선택하면 대화 종료까지 유지된다.
    * 이후 프롬프트에서 재선택할 필요 없다.
    * (실험 결과: 10개 연속 프롬프트에서 1회 선택으로 도구 활성 상태 유지 확인)
    *
    * @param tool - 선택할 도구
    */
   selectTool(tool: GeminiTool): Promise<Result<void, GeminiError>>;

  /**
   * 도구를 해제(비활성화)한다.
   *
   * 활성화된 도구의 선택 해제 칩을 클릭하거나,
   * 도구 메뉴에서 해당 항목을 다시 클릭한다.
   * 활성화되지 않은 도구를 해제하면 no-op.
   *
   * @param tool - 해제할 도구
   */
  deselectTool(tool: GeminiTool): Promise<Result<void, GeminiError>>;

  /**
   * 현재 활성화된 도구를 반환한다.
   *
   * 활성화된 도구가 없으면 `null`을 반환한다.
   */
  getActiveTool(): GeminiTool | null;

  // ─────────────────────────────────────────
  // Mode
  // ─────────────────────────────────────────

  /**
   * 채팅 모드를 변경한다.
   *
   * 모드 스위치 버튼을 클릭하여 메뉴를 열고,
   * 해당 모드의 `menuitemradio`를 선택한다.
   *
   * @param mode - 변경할 모드
   */
  switchMode(mode: ChatMode): Promise<Result<void, GeminiError>>;

  /**
   * 현재 채팅 모드를 반환한다.
   *
   * 모드 스위치 버튼의 텍스트를 읽어 판별한다.
   * 판별 불가 시 `'fast'`를 기본값으로 반환한다.
   */
  getCurrentMode(): ChatMode;

  // ─────────────────────────────────────────
  // Generation State
  // ─────────────────────────────────────────

  /**
   * 현재 생성 상태를 반환한다.
   *
   * DOM 시그널(전송 버튼 상태, 액션 버튼 존재, generated-image 존재 등)을
   * 종합하여 상태를 판별한다.
   */
  getGenerationState(): GenerationState;

  /**
   * 현재 응답이 생성 중인지 확인한다.
   *
   * `getGenerationState() === 'generating'`의 편의 메서드.
   */
  isGenerating(): boolean;

  /**
   * 현재 생성을 중지한다.
   *
   * 생성 중일 때 중지 버튼(전송 버튼이 변환된 상태)을 클릭한다.
   * 생성 중이 아니면 no-op.
   */
  stopGeneration(): Promise<Result<void, GeminiError>>;

  /**
   * 응답 완료를 대기한다.
   *
   * `generating` 상태가 종료될 때까지 폴링하며,
   * 완료된 응답의 정보를 반환한다.
   *
   * @param options - 타임아웃 및 폴링 간격 설정
   */
  waitForResponse(options?: WaitOptions): Promise<Result<ModelResponse, GeminiError>>;

  // ─────────────────────────────────────────
  // Response
  // ─────────────────────────────────────────

  /**
   * 모든 모델 응답을 반환한다.
   *
   * 현재 대화의 모든 `model-response` 요소를 파싱하여 반환한다.
   */
  getResponses(): ModelResponse[];

  /**
   * 마지막 모델 응답을 반환한다.
   *
   * 응답이 없으면 `null`을 반환한다.
   */
  getLastResponse(): ModelResponse | null;

  /**
   * 모델 응답 개수를 반환한다.
   */
  getResponseCount(): number;

  // ─────────────────────────────────────────
  // Images
  // ─────────────────────────────────────────

  /**
   * 현재 대화의 모든 생성 이미지를 반환한다.
   *
   * 모든 `model-response` 내의 `generated-image`를 수집한다.
   */
  getGeneratedImages(): GeneratedImage[];

  /**
   * 생성된 이미지 총 개수를 반환한다.
   */
  getGeneratedImageCount(): number;

  // ─────────────────────────────────────────
  // Download
  // ─────────────────────────────────────────

   /**
    * 이미지를 다운로드한다.
    *
    * 구현체에 따라:
    * - DOM 구현: `chrome.downloads.download()` API 사용 (background script 위임)
    * - API 구현: HTTP 다운로드
    *
    * @param image - 다운로드할 이미지 정보
    * @param options - 파일명, 충돌 처리 등 옵션
    */
   downloadImage(
     image: GeneratedImage,
     options?: DownloadOptions,
   ): Promise<Result<void, GeminiError>>;

   // ─────────────────────────────────────────
   // Conversation
   // ─────────────────────────────────────────

   /**
    * 현재 대화의 URL을 반환한다.
    *
    * 대화가 시작되면 `gemini.google.com/app/{conversationId}` 형태의 URL이 생성된다.
    * 새 채팅 상태(대화 시작 전)이면 `null`을 반환한다.
    *
    * @returns 현재 대화 URL 또는 null
    */
   getConversationUrl(): string | null;

   // ─────────────────────────────────────────
   // Locale
   // ─────────────────────────────────────────

  /**
   * 현재 페이지 로케일을 반환한다.
   *
   * aria-label 등의 텍스트를 기준으로 `'ko'` 또는 `'en'`을 판별한다.
   */
  getLocale(): GeminiLocale;
}
