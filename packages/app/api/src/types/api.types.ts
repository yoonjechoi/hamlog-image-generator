import type { Result } from '@hamlog/core';

/**
 * 이미지 생성 요청 본문.
 */
export interface ImageGenerateRequest {
  prompt: string;
  style?: string;
}

/**
 * 이미지 관련 API 오류 응답.
 */
export interface ImageApiError {
  code: 'INVALID_INPUT' | 'NOT_FOUND';
  message: string;
}

/**
 * 이미지 데이터 표현.
 */
export interface ImageData {
  id: string;
  prompt: string;
  style?: string;
  status: 'queued' | 'completed';
  url: string | null;
  createdAt: string;
}

/**
 * 이미지 생성 API 응답 형태.
 */
export interface ImageGenerateResponse {
  result: Result<ImageData, ImageApiError>;
}
