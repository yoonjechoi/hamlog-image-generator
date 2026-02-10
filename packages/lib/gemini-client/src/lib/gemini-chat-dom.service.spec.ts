import { describe, expect, it, vi } from 'vitest';
import { ARIA_LABELS, TOOL_LABELS } from './types/selectors.js';
import { GeminiChatDomService } from './gemini-chat-dom.service.js';

interface GeminiPageOptions {
  sendButtonLabel?: string;
  href?: string;
  modelResponses?: readonly ModelResponseOptions[];
  modeText?: string;
  deselectToolChipText?: string;
  promptInputExists?: boolean;
  newChatLinkExists?: boolean;
  toolsButton?: {
    label: string;
  };
  toolMenuItems?: ReadonlyArray<{
    role: string;
    text: string;
  }>;
  uploadButtonExists?: boolean;
  fileInputExists?: boolean;
  messageSender?: (message: unknown) => Promise<unknown>;
}

interface ModelResponseOptions {
  text?: string;
  imageCount?: number;
  includeThumbsUp?: boolean;
}

const MODE_TEXT_KO = {
  fast: '빠른 모드',
  thinking: '사고 모드',
} as const;

function setupGeminiPage(options: GeminiPageOptions = {}): GeminiChatDomService {
  document.body.innerHTML = '';

  if (options.sendButtonLabel) {
    const sendButton = document.createElement('button');
    sendButton.className = 'send-button';
    sendButton.setAttribute('aria-label', options.sendButtonLabel);
    document.body.appendChild(sendButton);
  }

  if (options.promptInputExists) {
    const promptInput = document.createElement('div');
    promptInput.setAttribute('contenteditable', 'true');
    promptInput.setAttribute('role', 'textbox');
    document.body.appendChild(promptInput);
  }

  if (options.newChatLinkExists) {
    const newChatLink = document.createElement('a');
    newChatLink.setAttribute('href', '/app');
    document.body.appendChild(newChatLink);
  }

  if (options.toolsButton) {
    const toolsButton = document.createElement('button');
    toolsButton.textContent = options.toolsButton.label;
    toolsButton.setAttribute('aria-label', options.toolsButton.label);
    document.body.appendChild(toolsButton);
  }

  for (const menuItem of options.toolMenuItems ?? []) {
    const item = document.createElement('div');
    item.setAttribute('role', menuItem.role);
    item.textContent = menuItem.text;
    document.body.appendChild(item);
  }

  if (options.uploadButtonExists) {
    const uploadButton = document.createElement('button');
    uploadButton.className = 'upload-card-button';
    document.body.appendChild(uploadButton);
  }

  if (options.fileInputExists) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.hidden = true;
    fileInput.multiple = true;
    document.body.appendChild(fileInput);
  }

  const href = options.href ?? 'https://gemini.google.com/app';
  const windowMock = { location: { href } } as unknown as Window;

  for (const responseOption of options.modelResponses ?? []) {
    const response = document.createElement('model-response');

    if (responseOption.text) {
      const textNode = document.createElement('div');
      textNode.textContent = responseOption.text;
      response.appendChild(textNode);
    }

    for (let index = 0; index < (responseOption.imageCount ?? 0); index += 1) {
      const generatedImage = document.createElement('generated-image');
      const img = document.createElement('img');
      img.src = `https://lh3.googleusercontent.com/image-${index}=s1024-rj`;
      generatedImage.appendChild(img);
      response.appendChild(generatedImage);
    }

    if (responseOption.includeThumbsUp) {
      const thumbsUp = document.createElement('button');
      thumbsUp.setAttribute('aria-label', ARIA_LABELS.ko.thumbsUp);
      response.appendChild(thumbsUp);
    }

    document.body.appendChild(response);
  }

  if (options.modeText) {
    const modeSwitch = document.createElement('div');
    modeSwitch.className = 'input-area-switch';
    modeSwitch.textContent = options.modeText;
    document.body.appendChild(modeSwitch);
  }

  if (options.deselectToolChipText) {
    const chip = document.createElement('button');
    chip.textContent = options.deselectToolChipText;
    document.body.appendChild(chip);
  }

  return new GeminiChatDomService(document, windowMock, options.messageSender);
}

describe('GeminiChatDomService', () => {
  describe('getLocale', () => {
    it('returns ko when send button aria-label is Korean', () => {
      const service = setupGeminiPage({ sendButtonLabel: ARIA_LABELS.ko.sendButton });

      expect(service.getLocale()).toBe('ko');
    });

    it('returns en when send button aria-label is English', () => {
      const service = setupGeminiPage({ sendButtonLabel: ARIA_LABELS.en.sendButton });

      expect(service.getLocale()).toBe('en');
    });

    it('returns ko by default when send button is not found', () => {
      const service = setupGeminiPage();

      expect(service.getLocale()).toBe('ko');
    });
  });

  describe('sendPrompt', () => {
    it('returns ok and sets textContent then clicks send button when textbox and send button exist', async () => {
      const service = setupGeminiPage({
        promptInputExists: true,
        sendButtonLabel: ARIA_LABELS.ko.sendButton,
      });
      const textbox = document.querySelector<HTMLDivElement>('div[contenteditable="true"][role="textbox"]');
      const sendButton = document.querySelector<HTMLButtonElement>('button.send-button');

      expect(textbox).not.toBeNull();
      expect(sendButton).not.toBeNull();

      const clickSpy = vi.spyOn(sendButton!, 'click');
      const inputEventSpy = vi.fn();
      textbox!.addEventListener('input', inputEventSpy);

      const result = await service.sendPrompt('테스트 프롬프트');

      expect(result.success).toBe(true);
      expect(textbox!.textContent).toBe('테스트 프롬프트');
      expect(inputEventSpy).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('returns ELEMENT_NOT_FOUND when textbox does not exist', async () => {
      const service = setupGeminiPage({ sendButtonLabel: ARIA_LABELS.ko.sendButton });

      const result = await service.sendPrompt('테스트 프롬프트');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('ELEMENT_NOT_FOUND');
      }
    });

    it('returns ELEMENT_NOT_FOUND when send button does not exist', async () => {
      const service = setupGeminiPage({ promptInputExists: true });

      const result = await service.sendPrompt('테스트 프롬프트');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('ELEMENT_NOT_FOUND');
      }
    });
  });

  describe('startNewChat', () => {
    it('returns ok and clicks new chat link when link exists', async () => {
      const service = setupGeminiPage({ newChatLinkExists: true });
      const newChatLink = document.querySelector<HTMLAnchorElement>('a[href="/app"]');

      expect(newChatLink).not.toBeNull();
      const clickSpy = vi.spyOn(newChatLink!, 'click');

      const result = await service.startNewChat();

      expect(result.success).toBe(true);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('returns ELEMENT_NOT_FOUND when new chat link does not exist', async () => {
      const service = setupGeminiPage();

      const result = await service.startNewChat();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('ELEMENT_NOT_FOUND');
      }
    });
  });

  describe('getConversationUrl', () => {
    it('returns URL when location href matches conversation pattern', () => {
      const service = setupGeminiPage({
        href: 'https://gemini.google.com/app/abcdef1234',
      });

      expect(service.getConversationUrl()).toBe('https://gemini.google.com/app/abcdef1234');
    });

    it('returns null when URL is app root', () => {
      const service = setupGeminiPage({ href: 'https://gemini.google.com/app' });

      expect(service.getConversationUrl()).toBeNull();
    });

    it('returns null when URL does not match conversation pattern', () => {
      const service = setupGeminiPage({ href: 'https://example.com/not-gemini' });

      expect(service.getConversationUrl()).toBeNull();
    });
  });

  describe('getGenerationState', () => {
    it('returns idle when no model-response exists', () => {
      const service = setupGeminiPage({ sendButtonLabel: ARIA_LABELS.ko.stopButton });

      expect(service.getGenerationState()).toBe('idle');
    });

    it('returns generating when send button aria-label contains stop', () => {
      const service = setupGeminiPage({
        sendButtonLabel: ARIA_LABELS.ko.stopButton,
        modelResponses: [{ text: '생성 중 응답' }],
      });

      expect(service.getGenerationState()).toBe('generating');
    });

    it('returns completed when thumbs-up exists and no generated image in last response', () => {
      const service = setupGeminiPage({
        modelResponses: [{ text: '완료된 텍스트', includeThumbsUp: true }],
      });

      expect(service.getGenerationState()).toBe('completed');
    });

    it('returns image_completed when thumbs-up exists and generated image exists in last response', () => {
      const service = setupGeminiPage({
        modelResponses: [{ text: '완료된 이미지 응답', includeThumbsUp: true, imageCount: 1 }],
      });

      expect(service.getGenerationState()).toBe('image_completed');
    });

    it('returns error when thumbs-up exists and response text contains safety pattern', () => {
      const service = setupGeminiPage({
        modelResponses: [{ text: '안전 장치로 인해 생성할 수 없습니다', includeThumbsUp: true }],
      });

      expect(service.getGenerationState()).toBe('error');
    });
  });

  describe('isGenerating', () => {
    it('returns true when state is generating', () => {
      const service = setupGeminiPage({
        sendButtonLabel: ARIA_LABELS.ko.stopButton,
        modelResponses: [{ text: '생성 중 응답' }],
      });

      expect(service.isGenerating()).toBe(true);
    });

    it('returns false when state is not generating', () => {
      const service = setupGeminiPage({
        modelResponses: [{ text: '완료됨', includeThumbsUp: true }],
      });

      expect(service.isGenerating()).toBe(false);
    });
  });

  describe('stopGeneration', () => {
    it('returns ok and clicks send button when generating', async () => {
      const service = setupGeminiPage({
        sendButtonLabel: ARIA_LABELS.ko.stopButton,
        modelResponses: [{ text: '생성 중 응답' }],
      });
      const sendButton = document.querySelector<HTMLButtonElement>('button.send-button');

      expect(sendButton).not.toBeNull();
      const clickSpy = vi.spyOn(sendButton!, 'click');

      const result = await service.stopGeneration();

      expect(result.success).toBe(true);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('returns ok with no-op when not generating', async () => {
      const service = setupGeminiPage({
        sendButtonLabel: ARIA_LABELS.ko.sendButton,
        modelResponses: [{ text: '완료 응답', includeThumbsUp: true }],
      });
      const sendButton = document.querySelector<HTMLButtonElement>('button.send-button');

      expect(sendButton).not.toBeNull();
      const clickSpy = vi.spyOn(sendButton!, 'click');

      const result = await service.stopGeneration();

      expect(result.success).toBe(true);
      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('returns ELEMENT_NOT_FOUND when send button is missing during generating state', async () => {
      const service = setupGeminiPage({ modelResponses: [{ text: '생성 중 응답' }] });
      vi.spyOn(service, 'isGenerating').mockReturnValue(true);

      const result = await service.stopGeneration();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('ELEMENT_NOT_FOUND');
      }
    });
  });

  describe('getCurrentMode', () => {
    it('returns fast when mode switch text contains fast mode label', () => {
      const service = setupGeminiPage({ modeText: MODE_TEXT_KO.fast });

      expect(service.getCurrentMode()).toBe('fast');
    });

    it('returns thinking when mode switch text contains thinking mode label', () => {
      const service = setupGeminiPage({ modeText: MODE_TEXT_KO.thinking });

      expect(service.getCurrentMode()).toBe('thinking');
    });

    it('returns fast by default when mode switch is not found', () => {
      const service = setupGeminiPage();

      expect(service.getCurrentMode()).toBe('fast');
    });
  });

  describe('selectTool', () => {
    it('returns ok and clicks tools button then tool menu item', async () => {
      const service = setupGeminiPage({
        toolsButton: { label: ARIA_LABELS.ko.toolsButton },
        toolMenuItems: [{ role: 'menuitemcheckbox', text: TOOL_LABELS.ko.image_generation }],
      });
      const toolsButton = Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
        .find((button) => (button.textContent ?? '').includes(ARIA_LABELS.ko.toolsButton));
      const menuItem = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]'))
        .find((item) => (item.textContent ?? '').includes(TOOL_LABELS.ko.image_generation));

      expect(toolsButton).toBeDefined();
      expect(menuItem).toBeDefined();

      const toolsClickSpy = vi.spyOn(toolsButton!, 'click');
      const menuItemClickSpy = vi.spyOn(menuItem!, 'click');

      const result = await service.selectTool('image_generation');

      expect(result.success).toBe(true);
      expect(toolsClickSpy).toHaveBeenCalledTimes(1);
      expect(menuItemClickSpy).toHaveBeenCalledTimes(1);
    });

    it('returns ok with no-op when tool is already active', async () => {
      const service = setupGeminiPage({
        toolsButton: { label: ARIA_LABELS.ko.toolsButton },
        deselectToolChipText: `${TOOL_LABELS.ko.image_generation} 선택 해제`,
      });
      const toolsButton = Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
        .find((button) => (button.textContent ?? '').includes(ARIA_LABELS.ko.toolsButton));

      expect(toolsButton).toBeDefined();
      const toolsClickSpy = vi.spyOn(toolsButton!, 'click');

      const result = await service.selectTool('image_generation');

      expect(result.success).toBe(true);
      expect(toolsClickSpy).not.toHaveBeenCalled();
    });

    it('returns ELEMENT_NOT_FOUND when tools button does not exist', async () => {
      const service = setupGeminiPage();

      const result = await service.selectTool('image_generation');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('ELEMENT_NOT_FOUND');
      }
    });

    it('returns ELEMENT_NOT_FOUND when tool menu item does not exist after opening tools menu', async () => {
      const service = setupGeminiPage({
        toolsButton: { label: ARIA_LABELS.ko.toolsButton },
      });
      const toolsButton = Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
        .find((button) => (button.textContent ?? '').includes(ARIA_LABELS.ko.toolsButton));

      expect(toolsButton).toBeDefined();
      const toolsClickSpy = vi.spyOn(toolsButton!, 'click');

      const result = await service.selectTool('image_generation');

      expect(result.success).toBe(false);
      expect(toolsClickSpy).toHaveBeenCalledTimes(1);
      if (!result.success) {
        expect(result.error.code).toBe('ELEMENT_NOT_FOUND');
      }
    });
  });

  describe('deselectTool', () => {
    it('returns ok and clicks deselect chip when active tool chip exists', async () => {
      const service = setupGeminiPage({
        deselectToolChipText: `${TOOL_LABELS.ko.image_generation} 선택 해제`,
      });
      const chip = Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
        .find((button) => (button.textContent ?? '').includes(`${TOOL_LABELS.ko.image_generation} 선택 해제`));

      expect(chip).toBeDefined();
      const clickSpy = vi.spyOn(chip!, 'click');

      const result = await service.deselectTool('image_generation');

      expect(result.success).toBe(true);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('returns ok with no-op when tool is not active', async () => {
      const service = setupGeminiPage();

      const result = await service.deselectTool('image_generation');

      expect(result.success).toBe(true);
    });
  });

  describe('switchMode', () => {
    it('returns ok and clicks mode switch then mode menu item', async () => {
      const service = setupGeminiPage({
        modeText: MODE_TEXT_KO.fast,
        toolMenuItems: [{ role: 'menuitemradio', text: MODE_TEXT_KO.thinking }],
      });
      const modeSwitch = document.querySelector<HTMLElement>('.input-area-switch');
      const modeMenuItem = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitemradio"]'))
        .find((item) => (item.textContent ?? '').includes(MODE_TEXT_KO.thinking));

      expect(modeSwitch).not.toBeNull();
      expect(modeMenuItem).toBeDefined();

      const switchClickSpy = vi.spyOn(modeSwitch!, 'click');
      const menuItemClickSpy = vi.spyOn(modeMenuItem!, 'click');

      const result = await service.switchMode('thinking');

      expect(result.success).toBe(true);
      expect(switchClickSpy).toHaveBeenCalledTimes(1);
      expect(menuItemClickSpy).toHaveBeenCalledTimes(1);
    });

    it('returns ok with no-op when already in requested mode', async () => {
      const service = setupGeminiPage({ modeText: MODE_TEXT_KO.fast });
      const modeSwitch = document.querySelector<HTMLElement>('.input-area-switch');

      expect(modeSwitch).not.toBeNull();
      const switchClickSpy = vi.spyOn(modeSwitch!, 'click');

      const result = await service.switchMode('fast');

      expect(result.success).toBe(true);
      expect(switchClickSpy).not.toHaveBeenCalled();
    });

    it('returns ELEMENT_NOT_FOUND when mode switch button does not exist', async () => {
      const service = setupGeminiPage();

      const result = await service.switchMode('thinking');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('ELEMENT_NOT_FOUND');
      }
    });

    it('returns ELEMENT_NOT_FOUND when mode menu item does not exist', async () => {
      const service = setupGeminiPage({ modeText: MODE_TEXT_KO.fast });
      const modeSwitch = document.querySelector<HTMLElement>('.input-area-switch');

      expect(modeSwitch).not.toBeNull();
      const switchClickSpy = vi.spyOn(modeSwitch!, 'click');

      const result = await service.switchMode('thinking');

      expect(result.success).toBe(false);
      expect(switchClickSpy).toHaveBeenCalledTimes(1);
      if (!result.success) {
        expect(result.error.code).toBe('ELEMENT_NOT_FOUND');
      }
    });
  });

  describe('downloadImage', () => {
    const image = {
      index: 0,
      responseIndex: 0,
      previewUrl: 'https://lh3.googleusercontent.com/image-0=s1024-rj',
      originalUrl: 'https://lh3.googleusercontent.com/image-0=s0',
    } as const;

    it('returns ok when messageSender is provided and succeeds', async () => {
      const messageSender = vi.fn(async () => ({ success: true }));
      const service = setupGeminiPage({ messageSender });

      const result = await service.downloadImage(image);

      expect(result.success).toBe(true);
      expect(messageSender).toHaveBeenCalledTimes(1);
    });

    it('returns DOWNLOAD_FAILED when messageSender is not provided', async () => {
      const service = setupGeminiPage();

      const result = await service.downloadImage(image);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('DOWNLOAD_FAILED');
      }
    });

    it('passes correct message format to messageSender', async () => {
      const messageSender = vi.fn(async () => ({ success: true }));
      const service = setupGeminiPage({ messageSender });

      const result = await service.downloadImage(image, {
        filename: 'test.png',
        conflictAction: 'overwrite',
      });

      expect(result.success).toBe(true);
      expect(messageSender).toHaveBeenCalledWith({
        type: 'DOWNLOAD_IMAGE',
        url: image.originalUrl,
        filename: 'test.png',
        conflictAction: 'overwrite',
      });
    });
  });

  describe('waitForResponse', () => {
    it('returns ok ModelResponse when response completes within timeout', async () => {
      vi.useFakeTimers();
      try {
        const service = setupGeminiPage({
          sendButtonLabel: ARIA_LABELS.ko.stopButton,
          modelResponses: [{ text: '생성 중 응답' }],
        });

        setTimeout(() => {
          const sendButton = document.querySelector<HTMLButtonElement>('button.send-button');
          const lastResponse = document.querySelector('model-response');
          if (sendButton && lastResponse) {
            sendButton.setAttribute('aria-label', ARIA_LABELS.ko.sendButton);
            const thumbsUp = document.createElement('button');
            thumbsUp.setAttribute('aria-label', ARIA_LABELS.ko.thumbsUp);
            lastResponse.appendChild(thumbsUp);
          }
        }, 300);

        const promise = service.waitForResponse({ timeout: 2_000, pollInterval: 100 });
        await vi.advanceTimersByTimeAsync(500);
        const result = await promise;

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.text).toContain('생성 중 응답');
        }
      } finally {
        vi.useRealTimers();
      }
    });

    it('returns TIMEOUT error when generation does not complete within timeout', async () => {
      vi.useFakeTimers();
      try {
        const service = setupGeminiPage({
          sendButtonLabel: ARIA_LABELS.ko.stopButton,
          modelResponses: [{ text: '계속 생성 중' }],
        });

        const promise = service.waitForResponse({ timeout: 500, pollInterval: 100 });
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe('TIMEOUT');
        }
      } finally {
        vi.useRealTimers();
      }
    });

    it('uses default timeout 120000 and pollInterval 1000', async () => {
      vi.useFakeTimers();
      try {
        const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
        const service = setupGeminiPage({
          sendButtonLabel: ARIA_LABELS.ko.stopButton,
          modelResponses: [{ text: '계속 생성 중' }],
        });

        const promise = service.waitForResponse();
        await vi.advanceTimersByTimeAsync(120_000);
        const result = await promise;

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe('TIMEOUT');
          expect(result.error.details).toMatchObject({ timeoutMs: 120_000 });
        }
        expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1_000);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('uploadFiles', () => {
    it('returns ok UploadedFile[] with mapped filenames when file input exists', async () => {
      const service = setupGeminiPage({
        uploadButtonExists: true,
        fileInputExists: true,
      });
      const uploadButton = document.querySelector<HTMLButtonElement>('button.upload-card-button');
      const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');

      expect(uploadButton).not.toBeNull();
      expect(fileInput).not.toBeNull();

      const uploadClickSpy = vi.spyOn(uploadButton!, 'click');
      const changeSpy = vi.fn();
      fileInput!.addEventListener('change', changeSpy);

      const fileA = new File(['a'], 'image-a.png', { type: 'image/png' });
      const fileB = new File(['b'], 'image-b.jpg', { type: 'image/jpeg' });

      const result = await service.uploadFiles([fileA, fileB]);

      expect(result.success).toBe(true);
      expect(uploadClickSpy).toHaveBeenCalledTimes(1);
      expect(changeSpy).toHaveBeenCalledTimes(1);
      if (result.success) {
        expect(result.data).toEqual([
          { filename: 'image-a.png', mimeType: 'image/png' },
          { filename: 'image-b.jpg', mimeType: 'image/jpeg' },
        ]);
      }
    });

    it('returns ELEMENT_NOT_FOUND when upload button does not exist', async () => {
      const service = setupGeminiPage({ fileInputExists: true });
      const fileA = new File(['a'], 'image-a.png', { type: 'image/png' });

      const result = await service.uploadFiles([fileA]);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('ELEMENT_NOT_FOUND');
      }
    });
  });

  describe('getActiveTool', () => {
    it('returns null when no tool deselect chip exists', () => {
      const service = setupGeminiPage();

      expect(service.getActiveTool()).toBeNull();
    });

    it('returns image_generation when image generation deselect chip exists', () => {
      const service = setupGeminiPage({
        deselectToolChipText: `${TOOL_LABELS.ko.image_generation} 선택 해제`,
      });

      expect(service.getActiveTool()).toBe('image_generation');
    });
  });

  describe('getResponses/getLastResponse/getResponseCount', () => {
    it('getResponses returns empty array when no model-response exists', () => {
      const service = setupGeminiPage();

      expect(service.getResponses()).toEqual([]);
    });

    it('getResponses returns parsed responses with text and images', () => {
      const service = setupGeminiPage({
        modelResponses: [{ text: '첫 번째 응답', imageCount: 1 }, { text: '두 번째 응답' }],
      });

      const responses = service.getResponses();

      expect(responses).toHaveLength(2);
      expect(responses[0]).toMatchObject({
        index: 0,
        text: '첫 번째 응답',
        isError: false,
      });
      expect(responses[0]?.images).toHaveLength(1);
      expect(responses[0]?.images[0]).toMatchObject({
        index: 0,
        responseIndex: 0,
        previewUrl: 'https://lh3.googleusercontent.com/image-0=s1024-rj',
        originalUrl: 'https://lh3.googleusercontent.com/image-0=s0',
      });
      expect(responses[1]).toMatchObject({
        index: 1,
        text: '두 번째 응답',
        images: [],
        isError: false,
      });
    });

    it('getLastResponse returns null when no responses', () => {
      const service = setupGeminiPage();

      expect(service.getLastResponse()).toBeNull();
    });

    it('getLastResponse returns last ModelResponse when responses exist', () => {
      const service = setupGeminiPage({
        modelResponses: [{ text: '첫 번째' }, { text: '마지막 응답', includeThumbsUp: true }],
      });

      const last = service.getLastResponse();

      expect(last).not.toBeNull();
      expect(last?.index).toBe(1);
      expect(last?.text).toContain('마지막 응답');
    });

    it('getResponseCount returns correct count', () => {
      const service = setupGeminiPage({
        modelResponses: [{ text: '1' }, { text: '2' }, { text: '3' }],
      });

      expect(service.getResponseCount()).toBe(3);
    });

    it('response with generated-image elements populates images array', () => {
      const service = setupGeminiPage({
        modelResponses: [{ text: '이미지 응답', imageCount: 2 }],
      });

      const response = service.getResponses()[0];

      expect(response?.images).toHaveLength(2);
      expect(response?.images[1]).toMatchObject({
        index: 1,
        responseIndex: 0,
      });
    });

    it('response with error text sets isError true', () => {
      const service = setupGeminiPage({
        modelResponses: [{ text: '안전 장치로 인해 생성할 수 없습니다', includeThumbsUp: true }],
      });

      const response = service.getResponses()[0];

      expect(response).toMatchObject({
        isError: true,
        errorMessage: '안전 장치로 인해 생성할 수 없습니다',
      });
    });
  });

  describe('getGeneratedImages/getGeneratedImageCount', () => {
    it('returns empty array when no generated images exist', () => {
      const service = setupGeminiPage({ modelResponses: [{ text: '텍스트만 있음' }] });

      expect(service.getGeneratedImages()).toEqual([]);
    });

    it('returns all images across responses with correct global indices', () => {
      const service = setupGeminiPage({
        modelResponses: [{ text: '첫 응답', imageCount: 1 }, { text: '둘째 응답', imageCount: 2 }],
      });

      const images = service.getGeneratedImages();

      expect(images).toHaveLength(3);
      expect(images[0]).toMatchObject({ index: 0, responseIndex: 0 });
      expect(images[1]).toMatchObject({ index: 1, responseIndex: 1 });
      expect(images[2]).toMatchObject({ index: 2, responseIndex: 1 });
    });

    it('getGeneratedImageCount returns total image count', () => {
      const service = setupGeminiPage({
        modelResponses: [{ text: '첫 응답', imageCount: 1 }, { text: '둘째 응답', imageCount: 2 }],
      });

      expect(service.getGeneratedImageCount()).toBe(3);
    });
  });
});
