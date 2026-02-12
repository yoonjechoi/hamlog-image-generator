import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 배치 이미지 생성 폼의 상태 타입이다.
 */
export interface BatchFormState {
  projectName: string;
  systemPrompt: string;
  referenceImage: File | null;
  referenceImagePreview: string | null;
  promptText: string;
}

/**
 * 배치 이미지 생성 폼 상태 변경 액션 타입이다.
 */
export interface BatchFormActions {
  setProjectName: (name: string) => void;
  setSystemPrompt: (prompt: string) => void;
  setReferenceImage: (file: File | null) => void;
  setPromptText: (text: string) => void;
  reset: () => void;
}

/**
 * 배치 이미지 생성 폼 상태와 액션을 제공한다.
 */
export function useBatchForm(): BatchFormState & BatchFormActions {
  const [projectName, setProjectName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [referenceImage, setReferenceImageState] = useState<File | null>(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
  const [promptText, setPromptText] = useState('');
  const previewUrlRef = useRef<string | null>(null);

  const clearPreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  const setReferenceImage = useCallback(
    (file: File | null) => {
      clearPreview();
      setReferenceImageState(file);

      if (!file) {
        setReferenceImagePreview(null);
        return;
      }

      const nextPreviewUrl = URL.createObjectURL(file);
      previewUrlRef.current = nextPreviewUrl;
      setReferenceImagePreview(nextPreviewUrl);
    },
    [clearPreview],
  );

  const reset = useCallback(() => {
    clearPreview();
    setProjectName('');
    setSystemPrompt('');
    setReferenceImageState(null);
    setReferenceImagePreview(null);
    setPromptText('');
  }, [clearPreview]);

  useEffect(() => {
    return () => {
      clearPreview();
    };
  }, [clearPreview]);

  return {
    projectName,
    systemPrompt,
    referenceImage,
    referenceImagePreview,
    promptText,
    setProjectName,
    setSystemPrompt,
    setReferenceImage,
    setPromptText,
    reset,
  };
}
