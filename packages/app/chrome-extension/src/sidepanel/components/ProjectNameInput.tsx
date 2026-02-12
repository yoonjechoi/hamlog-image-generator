import { Input } from './ui/input.js';
import { Label } from './ui/label.js';

/**
 * ProjectNameInput 컴포넌트의 props 타입이다.
 */
interface ProjectNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * 프로젝트명 입력 필드를 렌더링한다.
 */
export function ProjectNameInput({ value, onChange }: ProjectNameInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="project-name">프로젝트명 *</Label>
      <Input
        id="project-name"
        placeholder="예: 햄로그 블로그"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
