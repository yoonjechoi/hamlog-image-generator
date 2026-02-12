import { describe, it, expect } from 'vitest';
import { parsePrompts } from './prompt-parser.js';

describe('parsePrompts', () => {
  describe('single prompt', () => {
    it('should parse a single prompt', () => {
      const result = parsePrompts('a cat sitting on a mat');
      expect(result).toEqual(['a cat sitting on a mat']);
    });

    it('should handle single prompt with leading/trailing whitespace', () => {
      const result = parsePrompts('  a cat sitting on a mat  ');
      expect(result).toEqual(['a cat sitting on a mat']);
    });
  });

  describe('multiple prompts', () => {
    it('should parse multiple prompts separated by newlines', () => {
      const input = 'a cat\na dog\na bird';
      const result = parsePrompts(input);
      expect(result).toEqual(['a cat', 'a dog', 'a bird']);
    });

    it('should trim whitespace from each prompt', () => {
      const input = '  a cat  \n  a dog  \n  a bird  ';
      const result = parsePrompts(input);
      expect(result).toEqual(['a cat', 'a dog', 'a bird']);
    });

    it('should filter out empty lines', () => {
      const input = 'a cat\n\na dog\n\n\na bird';
      const result = parsePrompts(input);
      expect(result).toEqual(['a cat', 'a dog', 'a bird']);
    });

    it('should filter out lines with only whitespace', () => {
      const input = 'a cat\n   \na dog\n\t\na bird';
      const result = parsePrompts(input);
      expect(result).toEqual(['a cat', 'a dog', 'a bird']);
    });
  });

  describe('edge cases', () => {
    it('should return empty array for empty string', () => {
      const result = parsePrompts('');
      expect(result).toEqual([]);
    });

    it('should return empty array for whitespace-only string', () => {
      const result = parsePrompts('   ');
      expect(result).toEqual([]);
    });

    it('should return empty array for newline-only string', () => {
      const result = parsePrompts('\n\n\n');
      expect(result).toEqual([]);
    });

    it('should return empty array for mixed whitespace and newlines', () => {
      const result = parsePrompts('  \n  \n  ');
      expect(result).toEqual([]);
    });
  });

  describe('line ending handling', () => {
    it('should handle Unix line endings (LF)', () => {
      const input = 'a cat\na dog\na bird';
      const result = parsePrompts(input);
      expect(result).toEqual(['a cat', 'a dog', 'a bird']);
    });

    it('should handle Windows line endings (CRLF)', () => {
      const input = 'a cat\r\na dog\r\na bird';
      const result = parsePrompts(input);
      expect(result).toEqual(['a cat', 'a dog', 'a bird']);
    });

    it('should handle mixed line endings', () => {
      const input = 'a cat\na dog\r\na bird';
      const result = parsePrompts(input);
      expect(result).toEqual(['a cat', 'a dog', 'a bird']);
    });
  });

  describe('special characters and unicode', () => {
    it('should preserve special characters in prompts', () => {
      const input = 'a cat with @#$%\na dog with !@#$';
      const result = parsePrompts(input);
      expect(result).toEqual(['a cat with @#$%', 'a dog with !@#$']);
    });

    it('should preserve unicode characters', () => {
      const input = '한글 프롬프트\n日本語 プロンプト\nEmoji 😀';
      const result = parsePrompts(input);
      expect(result).toEqual(['한글 프롬프트', '日本語 プロンプト', 'Emoji 😀']);
    });
  });
});
