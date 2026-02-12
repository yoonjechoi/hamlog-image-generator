/**
 * @fileoverview Filename generator for downloaded images.
 *
 * Generates standardized filenames for downloaded images with support for
 * Korean characters, automatic slug processing, and zero-padded indexing.
 */

/**
 * Generates a standardized filename for downloaded images.
 *
 * Processes projectName and slug according to these rules:
 * - Preserves Korean characters (한글)
 * - Converts spaces to hyphens
 * - Removes special characters (keeps only alphanumeric, Korean, and hyphens)
 * - Lowercases English characters
 * - Truncates to 30 characters
 *
 * @param projectName - The project name to use as directory prefix
 * @param index - The 1-based index number (will be zero-padded to 3 digits)
 * @param slug - The slug for the filename
 * @returns A filename in format: `{projectName}/{NNN}_{slug}.png`
 *
 * @example
 * ```typescript
 * generateFilename('my-project', 1, 'test-image');
 * // Returns: 'my-project/001_test-image.png'
 *
 * generateFilename('프로젝트', 5, '한글-테스트');
 * // Returns: '프로젝트/005_한글-테스트.png'
 * ```
 */
export function generateFilename(
  projectName: string,
  index: number,
  slug: string
): string {
  /**
   * Processes a string by:
   * 1. Converting spaces to hyphens
   * 2. Removing special characters (keeping alphanumeric, Korean, hyphens)
   * 3. Lowercasing English characters
   * 4. Truncating to 30 characters
   */
  const processString = (str: string): string => {
    // Step 1: Convert spaces to hyphens
    let processed = str.replace(/ /g, '-');

    // Step 2: Remove special characters
    // Keep: alphanumeric (a-z, A-Z, 0-9), Korean characters, and hyphens
    // Korean Unicode range: AC00-D7A3 (Hangul Syllables)
    processed = processed.replace(/[^\w\-\uAC00-\uD7A3]/g, '');

    // Step 3: Lowercase English characters
    processed = processed.toLowerCase();

    // Step 4: Truncate to 30 characters
    processed = processed.substring(0, 30);

    return processed;
  };

  // Process projectName and slug
  const processedProjectName = processString(projectName);
  const processedSlug = processString(slug);

  // Format index with zero-padding to 3 digits
  const paddedIndex = String(index).padStart(3, '0');

  // Return formatted filename
  return `${processedProjectName}/${paddedIndex}_${processedSlug}.png`;
}
