/**
 * @fileoverview GeminiError 팩토리 함수.
 *
 * `Result<T, GeminiError>` 반환 시 일관된 에러 객체를 생성하기 위한
 * 헬퍼 함수 모음.
 */

import type { GeminiError, GeminiErrorCode } from './gemini-chat.types.js';

/**
 * GeminiError 객체를 생성한다.
 *
 * @param code - 에러 분류 코드
 * @param message - 사람이 읽을 수 있는 에러 메시지
 * @param details - 디버깅용 추가 정보
 * @returns GeminiError 객체
 */
export function geminiError(
  code: GeminiErrorCode,
  message: string,
  details?: unknown,
): GeminiError {
  return { code, message, details };
}

/**
 * DOM 요소를 찾을 수 없을 때의 에러를 생성한다.
 *
 * @param selector - 찾으려 했던 CSS 셀렉터 또는 설명
 */
export function elementNotFound(selector: string): GeminiError {
  return geminiError('ELEMENT_NOT_FOUND', `요소를 찾을 수 없음: ${selector}`);
}

/**
 * 작업 시간 초과 에러를 생성한다.
 *
 * @param operation - 시간 초과된 작업 설명
 * @param timeoutMs - 설정된 타임아웃 (ms)
 */
export function timeout(operation: string, timeoutMs: number): GeminiError {
  return geminiError('TIMEOUT', `${operation} 시간 초과 (${timeoutMs}ms)`, { timeoutMs });
}

/**
 * 현재 상태에서 해당 작업이 불가능할 때의 에러를 생성한다.
 *
 * @param operation - 시도한 작업
 * @param currentState - 현재 상태
 */
export function invalidState(operation: string, currentState: string): GeminiError {
  return geminiError(
    'INVALID_STATE',
    `현재 상태(${currentState})에서 ${operation} 불가`,
    { currentState },
  );
}

/**
 * 정책 차단 에러를 생성한다.
 *
 * @param responseText - 차단 응답 텍스트
 */
export function policyBlocked(responseText: string): GeminiError {
  return geminiError('POLICY_BLOCKED', '안전 정책에 의해 차단됨', { responseText });
}
