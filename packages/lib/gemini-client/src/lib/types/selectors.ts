/**
 * @fileoverview Gemini 웹 UI DOM 셀렉터 및 i18n 매핑.
 *
 * gemini.google.com/app의 DOM 구조는 Angular 기반이며,
 * 동적으로 생성되는 클래스/ID 대신 시맨틱 속성과
 * 커스텀 요소를 셀렉터로 사용한다.
 *
 * 모든 셀렉터는 2026-02-10 기준 실험 결과로 검증됨.
 */

import type { ChatMode, GeminiLocale, GeminiTool } from './gemini-chat.types.js';

// ─────────────────────────────────────────────
// CSS Selectors
// ─────────────────────────────────────────────

/**
 * Gemini 웹 UI의 CSS 셀렉터 상수.
 *
 * locale 독립적인 구조적 셀렉터만 포함한다.
 * aria-label 기반 셀렉터는 {@link ARIA_LABELS}를 참조.
 */
export const SELECTORS = {
  /** 프롬프트 입력 영역 (`contenteditable` div) */
  PROMPT_INPUT: 'div[contenteditable="true"][role="textbox"]',

  /** 전송/중지 버튼 */
  SEND_BUTTON: 'button.send-button',

  /** 파일 업로드 버튼 (`+` 아이콘) */
  UPLOAD_BUTTON: 'button.upload-card-button',

  /** 도구 버튼 (composer 내) */
  // NOTE: aria-label 기반이 아닌, 텍스트 기반으로 식별해야 함.
  //       `button[aria-label*="Tools"]`는 사이드바 항목과 충돌 위험.

  /** 모드 전환 버튼 */
  MODE_SWITCH: '.input-area-switch',

  /** 모드 메뉴 패널 */
  MODE_MENU: '.mat-mdc-menu-panel.gds-mode-switch-menu[role="menu"]',

  /** 모델 응답 요소 */
  MODEL_RESPONSE: 'model-response',

  /** 생성된 이미지 커스텀 요소 */
  GENERATED_IMAGE: 'generated-image',

  /** 생성된 이미지의 실제 img 태그 */
  GENERATED_IMAGE_IMG: 'generated-image img[src*="googleusercontent"]',

  /** 이미지 다운로드 버튼 */
  DOWNLOAD_BUTTON: 'button[data-test-id="download-generated-image-button"]',

  /** 새 채팅 링크 */
  NEW_CHAT_LINK: 'a[href="/app"]',
} as const;

// ─────────────────────────────────────────────
// Aria Labels (i18n)
// ─────────────────────────────────────────────

/**
 * 로케일별 aria-label 매핑.
 *
 * Gemini UI는 로케일에 따라 aria-label이 완전히 다르므로,
 * 모든 텍스트 기반 셀렉터는 이 매핑을 통해 접근해야 한다.
 */
export const ARIA_LABELS: Record<GeminiLocale, {
  /** 프롬프트 입력 placeholder */
  readonly promptPlaceholder: string;
  /** 전송 버튼 */
  readonly sendButton: string;
  /** 생성 중지 버튼 (전송 버튼이 변환됨) */
  readonly stopButton: string;
  /** 파일 업로드 메뉴 열기 */
  readonly uploadMenuOpen: string;
  /** 파일 업로드 메뉴 항목 */
  readonly uploadMenuItem: string;
  /** 도구 버튼 */
  readonly toolsButton: string;
  /** 이미지 다운로드 버튼 */
  readonly downloadButton: string;
  /** 좋아요 버튼 (응답 완료 시그널) */
  readonly thumbsUp: string;
  /** 싫어요 버튼 */
  readonly thumbsDown: string;
}> = {
  ko: {
    promptPlaceholder: '여기에 프롬프트 입력',
    sendButton: '메시지 보내기',
    stopButton: '대답 생성 중지',
    uploadMenuOpen: '파일 업로드 메뉴 열기',
    uploadMenuItem: '파일 업로드',
    toolsButton: '도구',
    downloadButton: '원본 크기 이미지 다운로드',
    thumbsUp: '마음에 들어요',
    thumbsDown: '마음에 들지 않아요',
  },
  en: {
    promptPlaceholder: 'Enter a prompt for Gemini',
    sendButton: 'Send message',
    stopButton: 'Stop generating',
    uploadMenuOpen: 'Open upload file menu',
    uploadMenuItem: 'Upload files',
    toolsButton: 'Tools',
    downloadButton: 'Download full size image',
    thumbsUp: 'Good response',
    thumbsDown: 'Bad response',
  },
} as const;

/**
 * 로케일별 도구 이름 매핑.
 *
 * 도구 메뉴의 `menuitemcheckbox` 텍스트와 매핑.
 */
export const TOOL_LABELS: Record<GeminiLocale, Record<GeminiTool, string>> = {
  ko: {
    image_generation: '이미지 생성하기',
    deep_research: 'Deep Research',
    video_generation: '동영상 만들기',
    canvas: 'Canvas',
    code_import: '코드 가져오기',
    guided_learning: '가이드 학습',
    notebook_lm: 'NotebookLM',
  },
  en: {
    image_generation: 'Create image',
    deep_research: 'Deep Research',
    video_generation: 'Create video',
    canvas: 'Canvas',
    code_import: 'Import code',
    guided_learning: 'Guided learning',
    notebook_lm: 'NotebookLM',
  },
} as const;

/**
 * 로케일별 모드 이름 매핑.
 *
 * 모드 메뉴의 `menuitemradio` 텍스트와 매핑.
 */
export const MODE_LABELS: Record<GeminiLocale, Record<ChatMode, string>> = {
  ko: {
    fast: '빠른 모드',
    thinking: '사고 모드',
    pro: 'Pro',
  },
  en: {
    fast: 'Fast',
    thinking: 'Thinking',
    pro: 'Pro',
  },
} as const;

/**
 * 에러 감지용 텍스트 패턴.
 *
 * 모델 응답 텍스트에 이 패턴이 포함되면 정책 차단으로 판단.
 */
export const ERROR_PATTERNS: Record<GeminiLocale, readonly string[]> = {
  ko: ['안전 장치', '생성할 수 없습니다'],
  en: ['safety settings', 'unable to generate'],
} as const;
