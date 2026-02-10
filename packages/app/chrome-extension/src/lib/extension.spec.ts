import { describe, expect, it } from 'vitest';
import { extensionDisplayName } from './extension.js';

describe('chrome-extension scaffold', () => {
  it('확장 프로그램 표시 이름을 제공한다', () => {
    expect(extensionDisplayName).toContain('Image Generator');
  });

  it('확장 프로그램 표시 이름은 비어있지 않다', () => {
    expect(extensionDisplayName.trim().length).toBeGreaterThan(0);
  });
});
