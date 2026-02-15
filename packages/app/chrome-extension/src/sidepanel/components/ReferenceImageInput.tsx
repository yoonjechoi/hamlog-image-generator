import { useRef } from 'react';
import { Button } from './ui/button.js';
import { Label } from './ui/label.js';

/**
 * ReferenceImageInput 컴포넌트의 props 타입이다.
 */
interface ReferenceImageInputProps {
  preview: string | null;
  onSelect: (file: File | null) => void;
}

/**
 * 참조 이미지 선택 및 미리보기 영역을 렌더링한다.
 */
export function ReferenceImageInput({ preview, onSelect }: ReferenceImageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onSelect(file);
  };

  const handleRemove = () => {
    onSelect(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>참조 이미지</Label>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          이미지 선택
        </Button>
        {preview && (
          <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
            제거
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {preview && (
        <img
          src={preview}
          alt="참조 이미지 미리보기"
          className="mt-2 w-full rounded-md border object-cover"
          style={{ maxHeight: '120px' }}
        />
      )}
    </div>
  );
}
