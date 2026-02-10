import { describe, expect, it } from 'vitest';
import { webAppDisplayName } from './web-app.js';

describe('web scaffold', () => {
  it('웹 앱 표시 이름을 제공한다', () => {
    expect(webAppDisplayName).toContain('Web');
  });
});
