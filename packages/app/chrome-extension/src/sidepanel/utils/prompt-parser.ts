/**
 * Parses newline-delimited text into an array of prompts.
 * Splits by newline, trims whitespace from each line, and filters out empty lines.
 * @param text - The newline-delimited text to parse
 * @returns An array of non-empty, trimmed prompt strings
 */
export function parsePrompts(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
