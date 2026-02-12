import { Textarea } from './ui/textarea.js';
import { Label } from './ui/label.js';

/**
 * PromptListInput 컴포넌트의 props 타입이다.
 */
interface PromptListInputProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * 프롬프트 목록 입력 필드를 렌더링한다.
 */
export function PromptListInput({ value, onChange }: PromptListInputProps) {
  const lineCount = value.split('\n').filter((l) => l.trim().length > 0).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="prompt-list">프롬프트 목록 *</Label>
        <span className="text-xs text-muted-foreground">{lineCount}개</span>
      </div>
      <Textarea
        id="prompt-list"
        placeholder={'한 줄에 하나씩 프롬프트를 입력하세요\n예:\n귀여운 고양이가 노트북을 보는 장면\n우주에서 피자를 먹는 우주비행사'}
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
