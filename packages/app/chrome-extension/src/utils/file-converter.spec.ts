// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { fileToDataUrl, dataUrlToFile } from './file-converter.js';

describe('file-converter', () => {
  describe('fileToDataUrl', () => {
    it('should convert a File to a data URL string', async () => {
      const content = 'test content';
      const file = new File([content], 'test.txt', { type: 'text/plain' });
      
      const dataUrl = await fileToDataUrl(file);
      
      expect(dataUrl).toMatch(/^data:text\/plain;base64,/);
      expect(typeof dataUrl).toBe('string');
    });

    it('should preserve mime type in data URL', async () => {
      const file = new File(['content'], 'test.json', { type: 'application/json' });
      
      const dataUrl = await fileToDataUrl(file);
      
      expect(dataUrl).toMatch(/^data:application\/json;base64,/);
    });

    it('should handle binary files', async () => {
      const buffer = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]); // JPEG header
      const file = new File([buffer], 'test.jpg', { type: 'image/jpeg' });
      
      const dataUrl = await fileToDataUrl(file);
      
      expect(dataUrl).toMatch(/^data:image\/jpeg;base64,/);
    });
  });

  describe('dataUrlToFile', () => {
    it('should convert a data URL back to a File', () => {
      const dataUrl = 'data:text/plain;base64,dGVzdCBjb250ZW50';
      const filename = 'test.txt';
      
      const file = dataUrlToFile(dataUrl, filename);
      
      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe(filename);
      expect(file.type).toBe('text/plain');
    });

    it('should preserve mime type from data URL', () => {
      const dataUrl = 'data:application/json;base64,eyJ0ZXN0IjoidmFsdWUifQ==';
      const filename = 'data.json';
      
      const file = dataUrlToFile(dataUrl, filename);
      
      expect(file.type).toBe('application/json');
    });

    it('should handle data URL without explicit mime type', () => {
      const dataUrl = 'data:;base64,dGVzdA==';
      const filename = 'test.bin';
      
      const file = dataUrlToFile(dataUrl, filename);
      
      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe(filename);
    });
  });

  describe('round-trip conversion', () => {
    it('should preserve content through File -> dataUrl -> File conversion', async () => {
      const originalContent = 'Hello, World!';
      const originalFile = new File([originalContent], 'test.txt', { type: 'text/plain' });
      
      const dataUrl = await fileToDataUrl(originalFile);
      const restoredFile = dataUrlToFile(dataUrl, originalFile.name);
      
      const restoredContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read'));
          }
        };
        reader.onerror = () => reject(new Error('Read error'));
        reader.readAsText(restoredFile);
      });
      expect(restoredContent).toBe(originalContent);
    });

    it('should preserve mime type through round-trip conversion', async () => {
      const originalFile = new File(['{"test": "data"}'], 'data.json', { type: 'application/json' });
      
      const dataUrl = await fileToDataUrl(originalFile);
      const restoredFile = dataUrlToFile(dataUrl, originalFile.name);
      
      expect(restoredFile.type).toBe(originalFile.type);
    });

    it('should preserve filename through round-trip conversion', async () => {
      const originalFilename = 'my-document.txt';
      const originalFile = new File(['content'], originalFilename, { type: 'text/plain' });
      
      const dataUrl = await fileToDataUrl(originalFile);
      const restoredFile = dataUrlToFile(dataUrl, originalFilename);
      
      expect(restoredFile.name).toBe(originalFilename);
    });

    it('should handle binary content in round-trip conversion', async () => {
      const binaryContent = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
      const originalFile = new File([binaryContent], 'image.jpg', { type: 'image/jpeg' });
      
      const dataUrl = await fileToDataUrl(originalFile);
      const restoredFile = dataUrlToFile(dataUrl, originalFile.name);
      
      const restoredContent = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result instanceof ArrayBuffer) {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read'));
          }
        };
        reader.onerror = () => reject(new Error('Read error'));
        reader.readAsArrayBuffer(restoredFile);
      });
      expect(new Uint8Array(restoredContent)).toEqual(binaryContent);
    });
  });
});
