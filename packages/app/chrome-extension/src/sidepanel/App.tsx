import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card.js';
import { ConnectionStatus } from './components/ConnectionStatus.js';
import { ProjectNameInput } from './components/ProjectNameInput.js';
import { SystemPromptInput } from './components/SystemPromptInput.js';
import { ReferenceImageInput } from './components/ReferenceImageInput.js';
import { PromptListInput } from './components/PromptListInput.js';
import { GenerateButton } from './components/GenerateButton.js';
import { useGeminiConnection } from './hooks/useGeminiConnection.js';
import { useBatchForm } from './hooks/useBatchForm.js';
import { parsePrompts } from './utils/prompt-parser.js';

/**
 * Chrome Extension 사이드 패널의 루트 컴포넌트이다.
 */
export function App() {
  const connection = useGeminiConnection();
  const form = useBatchForm();
  const prompts = useMemo(() => parsePrompts(form.promptText), [form.promptText]);
  const canSubmit =
    connection.connected &&
    form.projectName.trim().length > 0 &&
    prompts.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              햄로그의 슬기로운 이미지 생성기
            </CardTitle>
            <ConnectionStatus state={connection} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ProjectNameInput
              value={form.projectName}
              onChange={form.setProjectName}
            />
            <SystemPromptInput
              value={form.systemPrompt}
              onChange={form.setSystemPrompt}
            />
            <ReferenceImageInput
              preview={form.referenceImagePreview}
              onSelect={form.setReferenceImage}
            />
            <PromptListInput
              value={form.promptText}
              onChange={form.setPromptText}
            />
            <GenerateButton disabled={!canSubmit} promptCount={prompts.length} />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
