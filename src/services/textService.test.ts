import { describe, it, expect, vi } from 'vitest';
import { extractPageText } from './textService';

describe('textService', () => {
  describe('extractPageText', () => {
    it('should handle pages with no text', async () => {
      // Mock PDFDocumentProxy
      const mockPage = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [],
        }),
      };

      const mockPdfDoc = {
        getPage: vi.fn().mockResolvedValue(mockPage),
        numPages: 1,
      } as any;

      const text = await extractPageText(mockPdfDoc, 0);

      expect(text).toBe('');
      expect(mockPdfDoc.getPage).toHaveBeenCalledWith(1);
    });

    it('should extract text from page', async () => {
      const mockPage = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [
            { str: 'Hello', hasEOL: false, width: 30, x: 0 },
            { str: 'World', hasEOL: false, width: 30, x: 50 },
          ],
        }),
      };

      const mockPdfDoc = {
        getPage: vi.fn().mockResolvedValue(mockPage),
        numPages: 1,
      } as any;

      const text = await extractPageText(mockPdfDoc, 0);

      expect(text).toContain('Hello');
      expect(text).toContain('World');
    });

    it('should handle hasEOL flag correctly', async () => {
      const mockPage = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [
            { str: 'Line1', hasEOL: true, width: 30, x: 0 },
            { str: 'Line2', hasEOL: false, width: 30, x: 0 },
          ],
        }),
      };

      const mockPdfDoc = {
        getPage: vi.fn().mockResolvedValue(mockPage),
        numPages: 1,
      } as any;

      const text = await extractPageText(mockPdfDoc, 0);

      expect(text).toContain('Line1');
      expect(text).toContain('Line2');
    });

    it('should insert space with horizontal gap between items', async () => {
      const mockPage = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [
            { str: 'Hello', hasEOL: false, width: 30, x: 0 },
            { str: 'World', hasEOL: false, width: 30, x: 50 },
          ],
        }),
      };

      const mockPdfDoc = {
        getPage: vi.fn().mockResolvedValue(mockPage),
        numPages: 1,
      } as any;

      const text = await extractPageText(mockPdfDoc, 0);

      // Should have space between Hello and World due to gap
      expect(text).toBe('Hello World');
    });

    it('should handle pages with special characters', async () => {
      const mockPage = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [
            { str: 'Test\n' },
            { str: '123' },
            { str: '!@#' },
          ],
        }),
      };

      const mockPdfDoc = {
        getPage: vi.fn().mockResolvedValue(mockPage),
        numPages: 1,
      } as any;

      const text = await extractPageText(mockPdfDoc, 0);

      expect(text).toContain('Test');
      expect(text).toContain('123');
    });

    it('should handle extraction errors gracefully', async () => {
      const mockPdfDoc = {
        getPage: vi.fn().mockRejectedValue(new Error('PDF error')),
        numPages: 1,
      } as any;

      const text = await extractPageText(mockPdfDoc, 0);

      expect(text).toBe('');
    });

    it('should handle items without str property', async () => {
      const mockPage = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [
            { str: 'Valid', hasEOL: false, width: 30, x: 0 },
            { noStr: 'Invalid' },
            { str: 'Text', hasEOL: false, width: 30, x: 50 },
          ],
        }),
      };

      const mockPdfDoc = {
        getPage: vi.fn().mockResolvedValue(mockPage),
        numPages: 1,
      } as any;

      const text = await extractPageText(mockPdfDoc, 0);

      // Should have space between Valid and Text due to gap
      expect(text).toContain('Valid');
      expect(text).toContain('Text');
    });
  });
});
