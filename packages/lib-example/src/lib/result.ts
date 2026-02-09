/**
 * 성공과 실패를 명시적으로 구분하는 Result 타입.
 * 패키지 경계를 넘어 예외를 던지지 않기 위해 사용한다.
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * 성공 Result를 생성한다.
 * @param data - 성공 시 반환할 데이터
 * @returns success: true인 Result 객체
 */
export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * 실패 Result를 생성한다.
 * @param error - 실패 원인
 * @returns success: false인 Result 객체
 */
export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}
