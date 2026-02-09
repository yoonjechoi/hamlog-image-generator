import { ok, type Result } from '@org/lib-example';

/**
 * 사용자에게 인사 메시지를 반환한다.
 * @param name - 사용자 이름
 * @returns 인사 문자열을 포함한 Result
 */
export function greet(name: string): Result<string> {
  return ok(`Hello, ${name}!`);
}
