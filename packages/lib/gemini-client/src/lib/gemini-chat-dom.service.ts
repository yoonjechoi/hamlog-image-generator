import { err, ok, type Result } from '@hamlog/core';
import type { IGeminiChatService } from './gemini-chat-service.interface.js';
import { elementNotFound, geminiError, policyBlocked, timeout } from './types/errors.js';
import type {
  ChatMode,
  DownloadOptions,
  GenerateOptions,
  GeminiError,
  GeminiLocale,
  GeminiTool,
  GeneratedImage,
  GenerationState,
  ModelResponse,
  UploadedFile,
} from './types/gemini-chat.types.js';
import {
  ARIA_LABELS,
  CONVERSATION_URL_PATTERN,
  ERROR_PATTERNS,
  MODE_LABELS,
  SELECTORS,
  TOOL_LABELS,
} from './types/selectors.js';

/**
 * chrome.runtime.sendMessage 추상화 함수.
 */
export type MessageSender = (message: unknown) => Promise<unknown>;

/**
 * Gemini 웹 UI를 DOM 기반으로 제어하는 서비스 구현체.
 */
export class GeminiChatDomService implements IGeminiChatService {
  public constructor(
    private readonly document: Document,
    private readonly window: Window,
    private readonly messageSender?: MessageSender,
  ) {}

  public async startNewChat(): Promise<Result<void, GeminiError>> {
    const link = this.document.querySelector<HTMLAnchorElement>(SELECTORS.NEW_CHAT_LINK);
    if (!link) {
      return err(elementNotFound(SELECTORS.NEW_CHAT_LINK));
    }
    link.click();
    return ok(undefined);
  }

  public async generate(
    prompt: string,
    options?: GenerateOptions,
  ): Promise<Result<ModelResponse, GeminiError>> {
    const sendResult = await this.sendPrompt(prompt);
    if (!sendResult.success) {
      return sendResult;
    }

    if (options?.signal?.aborted) {
      return err(geminiError('INVALID_STATE', 'Generation aborted'));
    }

    return this.waitForResponse({
      timeout: options?.timeout,
      pollInterval: options?.pollInterval,
      signal: options?.signal,
    });
  }

  private async sendPrompt(text: string): Promise<Result<void, GeminiError>> {
    const textbox = this.document.querySelector<HTMLDivElement>(SELECTORS.PROMPT_INPUT);
    if (!textbox) {
      return err(elementNotFound(SELECTORS.PROMPT_INPUT));
    }

    const sendButton = this.document.querySelector<HTMLButtonElement>(SELECTORS.SEND_BUTTON);
    if (!sendButton) {
      return err(elementNotFound(SELECTORS.SEND_BUTTON));
    }

    textbox.textContent = text;
    textbox.dispatchEvent(new Event('input', { bubbles: true }));
    sendButton.click();
    return ok(undefined);
  }

  public async uploadFiles(files: File[]): Promise<Result<UploadedFile[], GeminiError>> {
    const uploadButton = this.document.querySelector<HTMLButtonElement>(SELECTORS.UPLOAD_BUTTON);
    if (!uploadButton) {
      return err(elementNotFound(SELECTORS.UPLOAD_BUTTON));
    }

    uploadButton.click();

    const fileInput = this.document.querySelector<HTMLInputElement>('input[type="file"]');
    if (!fileInput) {
      return err(geminiError('UPLOAD_FAILED', 'File input not found'));
    }

    Object.defineProperty(fileInput, 'files', {
      configurable: true,
      value: files as unknown as FileList,
    });
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));

    const uploaded: UploadedFile[] = files.map((file) => ({
      filename: file.name,
      mimeType: file.type,
    }));

    return ok(uploaded);
  }

  public async selectTool(tool: GeminiTool): Promise<Result<void, GeminiError>> {
    if (this.getActiveTool() === tool) {
      return ok(undefined);
    }

    const locale = this.getLocale();
    const toolsButtonLabels = [ARIA_LABELS[locale].toolsButton, ARIA_LABELS.ko.toolsButton, ARIA_LABELS.en.toolsButton];
    const buttons = Array.from(this.document.querySelectorAll<HTMLButtonElement>('button'));
    const toolsButton = buttons.find((button) => {
      const ariaLabel = button.getAttribute('aria-label') ?? '';
      const text = (button.textContent ?? '').trim();
      return toolsButtonLabels.some((label) => ariaLabel.includes(label) || text.includes(label));
    });
    if (!toolsButton) {
      return err(elementNotFound(ARIA_LABELS[locale].toolsButton));
    }

    toolsButton.click();

    const toolLabelCandidates = [TOOL_LABELS[locale][tool], TOOL_LABELS.ko[tool], TOOL_LABELS.en[tool]];
    const menuItems = Array.from(this.document.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]'));
    const menuItem = menuItems.find((item) => {
      const text = (item.textContent ?? '').trim();
      return toolLabelCandidates.some((label) => text.includes(label));
    });
    if (!menuItem) {
      return err(elementNotFound(toolLabelCandidates[0]));
    }

    menuItem.click();
    return ok(undefined);
  }

  public async deselectTool(tool: GeminiTool): Promise<Result<void, GeminiError>> {
    if (this.getActiveTool() !== tool) {
      return ok(undefined);
    }

    const toolLabels = [TOOL_LABELS.ko[tool], TOOL_LABELS.en[tool]];
    const deselectKeywords = ['선택 해제', 'deselect'];
    const buttons = Array.from(this.document.querySelectorAll<HTMLButtonElement>('button'));
    const chip = buttons.find((button) => {
      const text = (button.textContent ?? '').trim().toLowerCase();
      return toolLabels.some((label) => text.includes(label.toLowerCase()))
        && deselectKeywords.some((keyword) => text.includes(keyword.toLowerCase()));
    });

    if (!chip) {
      return err(elementNotFound(tool));
    }

    chip.click();
    return ok(undefined);
  }

  public getActiveTool(): GeminiTool | null {
    const buttons = Array.from(this.document.querySelectorAll<HTMLButtonElement>('button'));
    const deselectKeywords: Record<GeminiLocale, string> = {
      ko: '선택 해제',
      en: 'deselect',
    };

    for (const locale of ['ko', 'en'] as const) {
      const labels = TOOL_LABELS[locale];
      const keyword = deselectKeywords[locale];

      for (const tool of Object.keys(labels) as GeminiTool[]) {
        const toolLabel = labels[tool];
        const isSelected = buttons.some((button) => {
          const text = (button.textContent ?? '').trim();
          if (text.length === 0) {
            return false;
          }

          if (locale === 'en') {
            return text.toLowerCase().includes(toolLabel.toLowerCase())
              && text.toLowerCase().includes(keyword);
          }

          return text.includes(toolLabel) && text.includes(keyword);
        });

        if (isSelected) {
          return tool;
        }
      }
    }

    return null;
  }

  public async switchMode(mode: ChatMode): Promise<Result<void, GeminiError>> {
    if (this.getCurrentMode() === mode) {
      return ok(undefined);
    }

    const modeSwitch = this.document.querySelector<HTMLElement>(SELECTORS.MODE_SWITCH);
    if (!modeSwitch) {
      return err(elementNotFound(SELECTORS.MODE_SWITCH));
    }

    modeSwitch.click();

    const locale = this.getLocale();
    const modeLabelCandidates = [MODE_LABELS[locale][mode], MODE_LABELS.ko[mode], MODE_LABELS.en[mode]];
    const menuItems = Array.from(this.document.querySelectorAll<HTMLElement>('[role="menuitemradio"]'));
    const modeItem = menuItems.find((item) => {
      const text = (item.textContent ?? '').trim();
      return modeLabelCandidates.some((label) => text.includes(label));
    });

    if (!modeItem) {
      return err(elementNotFound(modeLabelCandidates[0]));
    }

    modeItem.click();
    return ok(undefined);
  }

  public getCurrentMode(): ChatMode {
    const modeText = this.document.querySelector(SELECTORS.MODE_SWITCH)?.textContent ?? '';

    for (const locale of ['ko', 'en'] as const) {
      if (modeText.includes(MODE_LABELS[locale].thinking)) {
        return 'thinking';
      }
      if (modeText.includes(MODE_LABELS[locale].pro)) {
        return 'pro';
      }
      if (modeText.includes(MODE_LABELS[locale].fast)) {
        return 'fast';
      }
    }

    return 'fast';
  }

  private getGenerationState(): GenerationState {
    const responses = this.document.querySelectorAll(SELECTORS.MODEL_RESPONSE);
    if (responses.length === 0) {
      return 'idle';
    }

    const sendButton = this.document.querySelector<HTMLButtonElement>(SELECTORS.SEND_BUTTON);
    const sendButtonLabel = sendButton?.getAttribute('aria-label') ?? '';
    const isStopLabel = Object.values(ARIA_LABELS).some(({ stopButton }) => sendButtonLabel.includes(stopButton));
    if (isStopLabel) {
      return 'generating';
    }

    const lastResponse = responses.item(responses.length - 1);
    const hasThumbsUp = Object.values(ARIA_LABELS).some(({ thumbsUp }) =>
      lastResponse.querySelector(`button[aria-label="${thumbsUp}"]`),
    );

    if (!hasThumbsUp) {
      return 'idle';
    }

    const responseText = (lastResponse.textContent ?? '').trim();
    const hasErrorPattern = Object.values(ERROR_PATTERNS).some((patterns) =>
      patterns.some((pattern) => responseText.includes(pattern)),
    );
    if (hasErrorPattern) {
      return 'error';
    }

    const hasGeneratedImage = lastResponse.querySelector(SELECTORS.GENERATED_IMAGE) !== null;
    return hasGeneratedImage ? 'image_completed' : 'completed';
  }

  private isGenerating(): boolean {
    return this.getGenerationState() === 'generating';
  }

  private async stopGeneration(): Promise<Result<void, GeminiError>> {
    if (!this.isGenerating()) {
      return ok(undefined);
    }

    const sendButton = this.document.querySelector<HTMLButtonElement>(SELECTORS.SEND_BUTTON);
    if (!sendButton) {
      return err(elementNotFound(SELECTORS.SEND_BUTTON));
    }

    sendButton.click();
    return ok(undefined);
  }

  private async waitForResponse(options?: {
    timeout?: number;
    pollInterval?: number;
    signal?: AbortSignal;
  }): Promise<Result<ModelResponse, GeminiError>> {
    const timeoutMs = options?.timeout ?? 120_000;
    const pollIntervalMs = options?.pollInterval ?? 1_000;
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      if (options?.signal?.aborted) {
        await this.stopGeneration();
        return err(geminiError('INVALID_STATE', 'Generation aborted'));
      }

      const state = this.getGenerationState();

      if (state !== 'generating' && state !== 'idle') {
        const lastResponse = this.getLastResponse();
        if (lastResponse) {
          if (state === 'error') {
            return err(policyBlocked(lastResponse.errorMessage ?? ''));
          }
          return ok(lastResponse);
        }
      }

      await this.delay(pollIntervalMs);
    }

    return err(timeout('waitForResponse', timeoutMs));
  }

  private getLastResponse(): ModelResponse | null {
    const responses = this.parseResponses();
    return responses.length > 0 ? responses[responses.length - 1] ?? null : null;
  }

  public async downloadImage(
    image: GeneratedImage,
    options?: DownloadOptions,
  ): Promise<Result<void, GeminiError>> {
    if (!this.messageSender) {
      return err(geminiError('DOWNLOAD_FAILED', 'MessageSender not configured'));
    }

    const message = {
      type: 'DOWNLOAD_IMAGE',
      url: image.originalUrl,
      filename: options?.filename,
      conflictAction: options?.conflictAction ?? 'uniquify',
    };

    try {
      const response = await this.messageSender(message) as { success: boolean; error?: string };
      if (response && !response.success) {
        return err(geminiError('DOWNLOAD_FAILED', response.error ?? 'Download failed'));
      }
      return ok(undefined);
    } catch (error) {
      return err(geminiError('DOWNLOAD_FAILED', String(error)));
    }
  }

  public getConversationUrl(): string | null {
    const { href } = this.window.location;
    return CONVERSATION_URL_PATTERN.test(href) ? href : null;
  }

  public getLocale(): GeminiLocale {
    const sendButton = this.document.querySelector<HTMLButtonElement>(SELECTORS.SEND_BUTTON);
    const label = sendButton?.getAttribute('aria-label') ?? '';

    if (label === ARIA_LABELS.en.sendButton) {
      return 'en';
    }

    return 'ko';
  }

  private parseResponses(): ModelResponse[] {
    const responseElements = Array.from(this.document.querySelectorAll(SELECTORS.MODEL_RESPONSE));
    let globalImageIndex = 0;

    return responseElements.map((element, responseIndex) => {
      const text = (element.textContent ?? '').trim();
      const images = Array.from(element.querySelectorAll<HTMLImageElement>(SELECTORS.GENERATED_IMAGE_IMG))
        .map((img) => {
          const previewUrl = img.src;
          const image: GeneratedImage = {
            index: globalImageIndex,
            responseIndex,
            previewUrl,
            originalUrl: this.toOriginalImageUrl(previewUrl),
          };
          globalImageIndex += 1;
          return image;
        });

      const isError = Object.values(ERROR_PATTERNS).some((patterns) =>
        patterns.some((pattern) => text.includes(pattern)),
      );

      if (isError) {
        return {
          index: responseIndex,
          text,
          images,
          isError,
          errorMessage: text,
        };
      }

      return {
        index: responseIndex,
        text,
        images,
        isError,
      };
    });
  }

  private toOriginalImageUrl(previewUrl: string): string {
    return previewUrl.replace(/=s\d+(-rj)?$/, '=s0');
  }

  private async delay(ms: number): Promise<void> {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
