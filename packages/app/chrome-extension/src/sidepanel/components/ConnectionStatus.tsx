import { Badge } from './ui/badge.js';
import type { GeminiConnectionState } from '../hooks/useGeminiConnection.js';

/**
 * ConnectionStatus 컴포넌트의 props 타입이다.
 */
interface ConnectionStatusProps {
  state: GeminiConnectionState;
}

/**
 * Gemini 연결 상태를 뱃지로 표시한다.
 */
export function ConnectionStatus({ state }: ConnectionStatusProps) {
  if (state.checking) {
    return <Badge variant="secondary">연결 확인 중...</Badge>;
  }

  return state.connected ? (
    <Badge variant="default">Gemini 연결됨</Badge>
  ) : (
    <Badge variant="destructive">Gemini 연결 안됨</Badge>
  );
}
