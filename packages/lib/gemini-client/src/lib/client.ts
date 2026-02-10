import { err, type Result } from '@hamlog/core';

/**
 * Gemini 텍스트 생성 요청 파라미터.
 */
export interface GeminiGenerateTextParams {
  prompt: string;
}

/**
 * Gemini 텍스트 생성 응답 데이터.
 */
export interface GeminiGenerateTextResponse {
  text: string;
}

/**
 * Gemini API 클라이언트 계약.
 */
export interface GeminiClient {
  /**
   * 프롬프트를 기반으로 텍스트를 생성한다.
   * @param params - 텍스트 생성 요청 값
   * @returns 생성 결과를 담은 Result
   */
  generateText(
    params: GeminiGenerateTextParams
  ): Promise<Result<GeminiGenerateTextResponse, Error>>;
}

/**
 * 실제 API 연동 전까지 사용하는 임시 클라이언트 구현체.
 */
export class PlaceholderGeminiClient implements GeminiClient {
  /**
   * 아직 API 키와 네트워크 설정이 없는 상태를 실패 Result로 반환한다.
   * @param params - 텍스트 생성 요청 값
   * @returns 미구현 상태를 나타내는 실패 Result
   */
  public async generateText(
    params: GeminiGenerateTextParams
  ): Promise<Result<GeminiGenerateTextResponse, Error>> {
    return err(new Error(`Gemini client is not configured yet: ${params.prompt}`));
  }
}
