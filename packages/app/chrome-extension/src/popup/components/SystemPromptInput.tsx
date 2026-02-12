import { Textarea } from './ui/textarea.js';
import { Label } from './ui/label.js';

/**
 * SystemPromptInput 컴포넌트의 props 타입이다.
 */
interface SystemPromptInputProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * 시스템 프롬프트 입력 필드를 렌더링한다.
 */
export function SystemPromptInput({ value, onChange }: SystemPromptInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="system-prompt">시스템 프롬프트</Label>
      <Textarea
        id="system-prompt"
        placeholder="이미지 생성 시 항상 적용할 지시사항 (선택)"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
