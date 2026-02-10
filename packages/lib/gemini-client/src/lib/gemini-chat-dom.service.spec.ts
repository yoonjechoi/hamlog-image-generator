import { describe, expect, it, vi } from 'vitest';
import { GeminiChatDomService } from './gemini-chat-dom.service.js';
import { ARIA_LABELS, TOOL_LABELS } from './types/selectors.js';

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
  describe('generate', () => {
    it('returns ok ModelResponse when generation completes', async () => {
      vi.useFakeTimers();
      try {
        const service = setupGeminiPage({
          promptInputExists: true,
          sendButtonLabel: ARIA_LABELS.ko.stopButton,
          modelResponses: [{ text: '완료된 텍스트 응답' }],
        });

        const sendButton = document.querySelector<HTMLButtonElement>('button.send-button');
        const textbox = document.querySelector<HTMLDivElement>('div[contenteditable="true"][role="textbox"]');
        expect(sendButton).not.toBeNull();
        expect(textbox).not.toBeNull();

        const clickSpy = vi.spyOn(sendButton!, 'click');

        setTimeout(() => {
          sendButton!.setAttribute('aria-label', ARIA_LABELS.ko.sendButton);
          const response = document.querySelector('model-response');
          if (response) {
            const thumbsUp = document.createElement('button');
            thumbsUp.setAttribute('aria-label', ARIA_LABELS.ko.thumbsUp);
            response.appendChild(thumbsUp);
          }
        }, 300);

        const promise = service.generate('테스트 프롬프트', { timeout: 2_000, pollInterval: 100 });
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(clickSpy).toHaveBeenCalledTimes(1);
        expect(textbox!.textContent).toBe('테스트 프롬프트');
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.text).toContain('완료된 텍스트 응답');
          expect(result.data.isError).toBe(false);
        }
      } finally {
        vi.useRealTimers();
      }
    });

    it('returns ELEMENT_NOT_FOUND when textbox does not exist', async () => {
      const service = setupGeminiPage({ sendButtonLabel: ARIA_LABELS.ko.sendButton });

      const result = await service.generate('테스트 프롬프트');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('ELEMENT_NOT_FOUND');
      }
    });

    it('returns ELEMENT_NOT_FOUND when send button does not exist', async () => {
      const service = setupGeminiPage({ promptInputExists: true });

      const result = await service.generate('테스트 프롬프트');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('ELEMENT_NOT_FOUND');
      }
    });

    it('returns TIMEOUT when generation does not complete', async () => {
      vi.useFakeTimers();
      try {
        const service = setupGeminiPage({
          promptInputExists: true,
          sendButtonLabel: ARIA_LABELS.ko.stopButton,
          modelResponses: [{ text: '계속 생성 중' }],
        });

        const promise = service.generate('지속 생성', { timeout: 500, pollInterval: 100 });
        await vi.advanceTimersByTimeAsync(700);
        const result = await promise;

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe('TIMEOUT');
        }
      } finally {
        vi.useRealTimers();
      }
    });

    it('returns POLICY_BLOCKED when response contains error pattern', async () => {
      vi.useFakeTimers();
      try {
        const service = setupGeminiPage({
          promptInputExists: true,
          sendButtonLabel: ARIA_LABELS.ko.stopButton,
          modelResponses: [{ text: '안전 장치로 인해 생성할 수 없습니다' }],
        });

        setTimeout(() => {
          const sendButton = document.querySelector<HTMLButtonElement>('button.send-button');
          const response = document.querySelector('model-response');
          if (sendButton && response) {
            sendButton.setAttribute('aria-label', ARIA_LABELS.ko.sendButton);
            const thumbsUp = document.createElement('button');
            thumbsUp.setAttribute('aria-label', ARIA_LABELS.ko.thumbsUp);
            response.appendChild(thumbsUp);
          }
        }, 200);

        const promise = service.generate('정책 차단 테스트', { timeout: 2_000, pollInterval: 100 });
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe('POLICY_BLOCKED');
        }
      } finally {
        vi.useRealTimers();
      }
    });

    it('returns error when signal is already aborted', async () => {
      const service = setupGeminiPage({
        promptInputExists: true,
        sendButtonLabel: ARIA_LABELS.ko.sendButton,
      });
      const controller = new AbortController();
      controller.abort();

      const result = await service.generate('취소된 요청', { signal: controller.signal });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_STATE');
      }
    });

    it('returns image_completed ModelResponse with images array', async () => {
      vi.useFakeTimers();
      try {
        const service = setupGeminiPage({
          promptInputExists: true,
          sendButtonLabel: ARIA_LABELS.ko.stopButton,
          modelResponses: [{ text: '이미지 응답', imageCount: 2 }],
        });

        setTimeout(() => {
          const sendButton = document.querySelector<HTMLButtonElement>('button.send-button');
          const response = document.querySelector('model-response');
          if (sendButton && response) {
            sendButton.setAttribute('aria-label', ARIA_LABELS.ko.sendButton);
            const thumbsUp = document.createElement('button');
            thumbsUp.setAttribute('aria-label', ARIA_LABELS.ko.thumbsUp);
            response.appendChild(thumbsUp);
          }
        }, 200);

        const promise = service.generate('이미지 생성', { timeout: 2_000, pollInterval: 100 });
        await vi.advanceTimersByTimeAsync(600);
        const result = await promise;

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.images).toHaveLength(2);
          expect(result.data.images[0]).toMatchObject({
            index: 0,
            responseIndex: 0,
            previewUrl: 'https://lh3.googleusercontent.com/image-0=s1024-rj',
            originalUrl: 'https://lh3.googleusercontent.com/image-0=s0',
          });
        }
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('getLocale', () => {
    it('returns ko when send button aria-label is Korean', () => {
      const service = setupGeminiPage({ sendButtonLabel: ARIA_LABELS.ko.sendButton });
      expect(service.getLocale()).toBe('ko');
    });

    it('returns en when send button aria-label is English', () => {
      const service = setupGeminiPage({ sendButtonLabel: ARIA_LABELS.en.sendButton });
      expect(service.getLocale()).toBe('en');
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
  });

  describe('getConversationUrl', () => {
    it('returns URL when location href matches conversation pattern', () => {
      const service = setupGeminiPage({ href: 'https://gemini.google.com/app/abcdef1234' });
      expect(service.getConversationUrl()).toBe('https://gemini.google.com/app/abcdef1234');
    });

    it('returns null when URL is app root', () => {
      const service = setupGeminiPage({ href: 'https://gemini.google.com/app' });
      expect(service.getConversationUrl()).toBeNull();
    });
  });

  describe('selectTool / deselectTool / getActiveTool', () => {
    it('selectTool returns ok and clicks tools button then tool menu item', async () => {
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

    it('deselectTool returns ok and clicks deselect chip when active tool chip exists', async () => {
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

    it('getActiveTool returns image_generation when image generation deselect chip exists', () => {
      const service = setupGeminiPage({
        deselectToolChipText: `${TOOL_LABELS.ko.image_generation} 선택 해제`,
      });

      expect(service.getActiveTool()).toBe('image_generation');
    });
  });

  describe('switchMode / getCurrentMode', () => {
    it('switchMode returns ok and clicks mode switch then mode menu item', async () => {
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

    it('getCurrentMode returns fast when mode switch text contains fast mode label', () => {
      const service = setupGeminiPage({ modeText: MODE_TEXT_KO.fast });
      expect(service.getCurrentMode()).toBe('fast');
    });
  });

  describe('uploadFiles', () => {
    it('returns ok UploadedFile[] with mapped filenames when file input exists', async () => {
      const service = setupGeminiPage({ uploadButtonExists: true, fileInputExists: true });
      const fileA = new File(['a'], 'image-a.png', { type: 'image/png' });
      const fileB = new File(['b'], 'image-b.jpg', { type: 'image/jpeg' });

      const result = await service.uploadFiles([fileA, fileB]);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([
          { filename: 'image-a.png', mimeType: 'image/png' },
          { filename: 'image-b.jpg', mimeType: 'image/jpeg' },
        ]);
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
  });
});
