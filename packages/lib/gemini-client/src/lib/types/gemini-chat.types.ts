/**
 * @fileoverview Gemini Chat 서비스의 핵심 타입 정의.
 *
 * Gemini 웹 UI(gemini.google.com/app)를 프로그래밍 방식으로 제어하기 위한
 * 모든 타입을 정의한다. DOM 구현체, API 구현체 등 어떤 구현이든
 * 이 타입들을 기반으로 동작한다.
 */

// ─────────────────────────────────────────────
// Enums & Literals
// ─────────────────────────────────────────────

/** Gemini 페이지 로케일. */
export type GeminiLocale = 'ko' | 'en';

/**
 * 모델 응답 생성 상태.
 *
 * - `idle`: 대기 상태 (새 채팅 또는 이전 응답 완료 후)
 * - `generating`: 응답 생성 중 (전송 버튼이 중지 버튼으로 변환됨)
 * - `completed`: 텍스트 응답 완료
 * - `image_completed`: 이미지 포함 응답 완료
 * - `error`: 정책 차단 등 에러 응답
 */
export type GenerationState =
  | 'idle'
  | 'generating'
  | 'completed'
  | 'image_completed'
  | 'error';

/**
 * 채팅 모드.
 *
 * - `fast`: 빠른 모드 (빠른 응답, 낮은 품질)
 * - `thinking`: 사고 모드 (느린 응답, 높은 품질)
 * - `pro`: Pro 모드
 */
export type ChatMode = 'fast' | 'thinking' | 'pro';

/**
 * Gemini 도구.
 *
 * 도구 메뉴(`menuitemcheckbox`)에서 선택 가능한 항목들.
 * DOM에서 `menuitemcheckbox`로 렌더링되며, 한 번에 하나만 활성화 가능.
 */
export type GeminiTool =
  | 'image_generation'
  | 'deep_research'
  | 'video_generation'
  | 'canvas'
  | 'code_import'
  | 'guided_learning'
  | 'notebook_lm';

// ─────────────────────────────────────────────
// Error
// ─────────────────────────────────────────────

/**
 * Gemini 에러 코드.
 *
 * - `ELEMENT_NOT_FOUND`: DOM 요소를 찾을 수 없음
 * - `TIMEOUT`: 작업 시간 초과
 * - `UPLOAD_FAILED`: 파일 업로드 실패
 * - `GENERATION_FAILED`: 응답 생성 실패
 * - `DOWNLOAD_FAILED`: 이미지 다운로드 실패
 * - `POLICY_BLOCKED`: 안전 정책에 의해 차단됨
 * - `INVALID_STATE`: 현재 상태에서 해당 작업 불가
 * - `UNKNOWN`: 분류 불가능한 에러
 */
export type GeminiErrorCode =
  | 'ELEMENT_NOT_FOUND'
  | 'TIMEOUT'
  | 'UPLOAD_FAILED'
  | 'GENERATION_FAILED'
  | 'DOWNLOAD_FAILED'
  | 'POLICY_BLOCKED'
  | 'INVALID_STATE'
  | 'UNKNOWN';

/**
 * Gemini 서비스 에러.
 *
 * 모든 서비스 메서드는 throw 대신 `Result<T, GeminiError>`를 반환한다.
 */
export interface GeminiError {
  /** 에러 분류 코드 */
  readonly code: GeminiErrorCode;
  /** 사람이 읽을 수 있는 에러 메시지 */
  readonly message: string;
  /** 디버깅용 추가 정보 */
  readonly details?: unknown;
}

// ─────────────────────────────────────────────
// Data Models
// ─────────────────────────────────────────────

/**
 * 생성된 이미지 정보.
 *
 * `generated-image` 요소에서 추출한 이미지 메타데이터.
 * `previewUrl`은 `=s1024-rj` 축소판, `originalUrl`은 `=s0` 원본 크기.
 */
export interface GeneratedImage {
  /** 전체 대화 내 이미지 인덱스 (0-based) */
  readonly index: number;
  /** 이미지가 속한 응답 인덱스 (0-based) */
  readonly responseIndex: number;
  /** 미리보기 URL (`=s1024-rj`) */
  readonly previewUrl: string;
  /** 원본 크기 URL (`=s0`) */
  readonly originalUrl: string;
}

/**
 * 모델 응답 정보.
 *
 * `model-response` 요소에서 추출한 하나의 응답 단위.
 * 텍스트, 이미지, 에러 정보를 모두 포함한다.
 */
export interface ModelResponse {
  /** 응답 인덱스 (0-based, `model-response` 등장 순서) */
  readonly index: number;
  /** 응답 텍스트 (마크다운 포함 가능) */
  readonly text: string;
  /** 이 응답에 포함된 생성 이미지 목록 */
  readonly images: readonly GeneratedImage[];
  /** 정책 차단 등 에러 응답인지 여부 */
  readonly isError: boolean;
  /** 에러 메시지 (`isError`가 true일 때) */
  readonly errorMessage?: string;
}

/**
 * 업로드 완료된 파일 정보.
 *
 * 업로드 후 composer 영역에 나타나는 미리보기 칩 정보.
 */
export interface UploadedFile {
  /** 원본 파일명 */
  readonly filename: string;
  /** MIME 타입 (예: `'image/png'`, `'image/jpeg'`) */
  readonly mimeType: string;
  /** 미리보기 URL (blob URL 형태, 예: `blob:https://gemini.google.com/...`) */
  readonly previewUrl?: string;
}

// ─────────────────────────────────────────────
// Options
// ─────────────────────────────────────────────

/**
 * 응답 대기 옵션.
 */
export interface WaitOptions {
  /** 최대 대기 시간 (ms). 기본값: 120000 (2분) */
  readonly timeout?: number;
  /** 상태 폴링 간격 (ms). 기본값: 1000 (1초) */
  readonly pollInterval?: number;
}

/**
 * 이미지 다운로드 옵션.
 */
export interface DownloadOptions {
  /**
   * 커스텀 파일명.
   * 지정하지 않으면 서버 기본 파일명 사용.
   * 예: `'001_snowflake_pattern.png'`
   */
  readonly filename?: string;
  /**
   * 파일명 충돌 시 동작.
   * - `uniquify`: 자동 번호 추가 (기본값)
   * - `overwrite`: 덮어쓰기
   * - `prompt`: 사용자에게 묻기
   */
  readonly conflictAction?: 'uniquify' | 'overwrite' | 'prompt';
}
