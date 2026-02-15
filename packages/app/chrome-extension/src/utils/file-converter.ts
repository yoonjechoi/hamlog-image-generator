/**
 * Converts a File object to a data URL string.
 * @param file - The File object to convert
 * @returns A promise that resolves to a data URL string
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read file as data URL'));
      }
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a data URL string back to a File object.
 * @param dataUrl - The data URL string to convert
 * @param filename - The filename for the resulting File object
 * @returns A File object with the extracted content and mime type
 */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const parts = dataUrl.split(',');
  if (parts.length < 2 || !parts[0].startsWith('data:')) {
    throw new Error('Invalid data URL format');
  }
  const header = parts[0];
  const data = parts[1];

  const mimeMatch = header.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : '';

  let binaryString: string;
  try {
    binaryString = atob(data);
  } catch (cause) {
    throw new Error('Invalid base64 data', { cause });
  }
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new File([bytes], filename, { type: mimeType });
}
