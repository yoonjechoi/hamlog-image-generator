import { describe, expect, it } from 'vitest';
import {
  createGenerateImageMessage,
  createPopupReadyMessage,
  getConnectionStatusLabel,
  isExtensionRequestMessage,
  isGeminiAppUrl,
} from './chrome-messages.js';

describe('chrome message utilities', () => {
  it('Gemini 앱 URL을 올바르게 식별한다', () => {
    expect(isGeminiAppUrl('https://gemini.google.com/app/123')).toBe(true);
    expect(isGeminiAppUrl('https://gemini.google.com/')).toBe(false);
  });

  it('연결 상태 라벨을 한국어로 반환한다', () => {
    expect(getConnectionStatusLabel(true)).toBe('Gemini 연결됨');
    expect(getConnectionStatusLabel(false)).toBe('Gemini 연결 안됨');
  });

  it('요청 메시지 생성 헬퍼를 제공한다', () => {
    expect(createPopupReadyMessage()).toEqual({ type: 'POPUP_READY' });
    expect(createGenerateImageMessage('프롬프트')).toEqual({
      type: 'GENERATE_IMAGE',
      prompt: '프롬프트',
    });
  });

  it('요청 메시지 타입 가드를 제공한다', () => {
    expect(isExtensionRequestMessage({ type: 'PING' })).toBe(true);
    expect(isExtensionRequestMessage({ type: 'GENERATE_IMAGE', prompt: 'x' })).toBe(true);
    expect(isExtensionRequestMessage({ type: 'GENERATE_IMAGE' })).toBe(false);
    expect(isExtensionRequestMessage({ type: 'UNKNOWN' })).toBe(false);
  });
});
