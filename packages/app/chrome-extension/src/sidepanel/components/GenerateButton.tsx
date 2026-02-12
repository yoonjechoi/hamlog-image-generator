import { Button } from './ui/button.js';

/**
 * GenerateButton 컴포넌트의 props 타입이다.
 */
interface GenerateButtonProps {
  disabled: boolean;
  promptCount: number;
}

/**
 * 이미지 생성 실행 버튼을 렌더링한다.
 */
export function GenerateButton({ disabled, promptCount }: GenerateButtonProps) {
  return (
    <Button type="submit" className="w-full" disabled={disabled}>
      {promptCount > 0 ? `${promptCount}개 이미지 생성` : '이미지 생성'}
    </Button>
  );
}
