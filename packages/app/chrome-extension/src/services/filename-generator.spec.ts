import { describe, it, expect } from 'vitest';
import { generateFilename } from './filename-generator.js';

describe('generateFilename', () => {
  describe('basic filename generation', () => {
    it('should generate filename with correct format: projectName/NNN_slug.png', () => {
      const result = generateFilename('my-project', 1, 'test-image');
      expect(result).toBe('my-project/001_test-image.png');
    });

    it('should zero-pad index to 3 digits', () => {
      expect(generateFilename('project', 1, 'slug')).toBe('project/001_slug.png');
      expect(generateFilename('project', 12, 'slug')).toBe('project/012_slug.png');
      expect(generateFilename('project', 123, 'slug')).toBe('project/123_slug.png');
      expect(generateFilename('project', 999, 'slug')).toBe('project/999_slug.png');
    });
  });

  describe('Korean character handling', () => {
    it('should preserve Korean characters in slug', () => {
      const result = generateFilename('project', 1, '한글테스트');
      expect(result).toBe('project/001_한글테스트.png');
    });

    it('should preserve Korean characters in projectName', () => {
      const result = generateFilename('프로젝트', 1, 'test');
      expect(result).toBe('프로젝트/001_test.png');
    });

    it('should preserve mixed Korean and English', () => {
      const result = generateFilename('프로젝트-project', 1, '테스트-test');
      expect(result).toBe('프로젝트-project/001_테스트-test.png');
    });
  });

  describe('space handling', () => {
    it('should convert spaces to hyphens in slug', () => {
      const result = generateFilename('project', 1, 'test image');
      expect(result).toBe('project/001_test-image.png');
    });

    it('should convert spaces to hyphens in projectName', () => {
      const result = generateFilename('my project', 1, 'slug');
      expect(result).toBe('my-project/001_slug.png');
    });

    it('should handle multiple consecutive spaces', () => {
      const result = generateFilename('my  project', 1, 'test  slug');
      expect(result).toBe('my--project/001_test--slug.png');
    });
  });

  describe('special character removal', () => {
    it('should remove special characters from slug', () => {
      const result = generateFilename('project', 1, 'test@#$%image');
      expect(result).toBe('project/001_testimage.png');
    });

    it('should remove special characters from projectName', () => {
      const result = generateFilename('my@project#name', 1, 'slug');
      expect(result).toBe('myprojectname/001_slug.png');
    });

    it('should keep alphanumeric, Korean, and hyphens', () => {
      const result = generateFilename('project-123', 1, 'test-한글-456');
      expect(result).toBe('project-123/001_test-한글-456.png');
    });

    it('should remove punctuation and symbols', () => {
      const result = generateFilename('project!@#$%^&*()', 1, 'slug!@#$%');
      expect(result).toBe('project/001_slug.png');
    });
  });

  describe('lowercasing', () => {
    it('should lowercase English characters in slug', () => {
      const result = generateFilename('project', 1, 'TEST-IMAGE');
      expect(result).toBe('project/001_test-image.png');
    });

    it('should lowercase English characters in projectName', () => {
      const result = generateFilename('MY-PROJECT', 1, 'slug');
      expect(result).toBe('my-project/001_slug.png');
    });

    it('should not affect Korean characters', () => {
      const result = generateFilename('프로젝트', 1, '한글테스트');
      expect(result).toBe('프로젝트/001_한글테스트.png');
    });
  });

  describe('truncation to 30 characters', () => {
    it('should truncate slug to 30 characters', () => {
      const longSlug = 'a'.repeat(40);
      const result = generateFilename('project', 1, longSlug);
      expect(result).toBe(`project/001_${'a'.repeat(30)}.png`);
    });

    it('should truncate projectName to 30 characters', () => {
      const longProject = 'a'.repeat(40);
      const result = generateFilename(longProject, 1, 'slug');
      expect(result).toBe(`${'a'.repeat(30)}/001_slug.png`);
    });

    it('should truncate Korean text to 30 characters', () => {
      const longKorean = '한'.repeat(40);
      const result = generateFilename('project', 1, longKorean);
      expect(result).toBe(`project/001_${'한'.repeat(30)}.png`);
    });

    it('should truncate after processing (spaces to hyphens, special chars removed)', () => {
      const slug = 'test-image-with-very-long-name-that-exceeds-limit';
      const result = generateFilename('project', 1, slug);
      expect(result.length).toBeLessThanOrEqual('project/001_'.length + 30 + '.png'.length);
    });
  });

  describe('combined transformations', () => {
    it('should apply all transformations in correct order', () => {
      const result = generateFilename('My Project!', 5, 'Test Image #1');
      expect(result).toBe('my-project/005_test-image-1.png');
    });

    it('should handle complex Korean and English mix', () => {
      const result = generateFilename('프로젝트 Project!', 10, '테스트 Image #2');
      expect(result).toBe('프로젝트-project/010_테스트-image-2.png');
    });

    it('should handle edge case with only special characters', () => {
      const result = generateFilename('!@#$%', 1, '^&*()');
      expect(result).toBe('/001_.png');
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      const result = generateFilename('', 1, '');
      expect(result).toBe('/001_.png');
    });

    it('should handle single character names', () => {
      const result = generateFilename('a', 1, 'b');
      expect(result).toBe('a/001_b.png');
    });

    it('should handle index 0', () => {
      const result = generateFilename('project', 0, 'slug');
      expect(result).toBe('project/000_slug.png');
    });

    it('should handle large index numbers', () => {
      const result = generateFilename('project', 9999, 'slug');
      expect(result).toBe('project/9999_slug.png');
    });

    it('should handle names with only spaces', () => {
      const result = generateFilename('   ', 1, '   ');
      expect(result).toBe('---/001_---.png');
    });
  });
});
