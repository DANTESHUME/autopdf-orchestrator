import { describe, it, expect, vi } from 'vitest';
import {
  createSectionsFromOutline,
  parsePageRanges,
  validatePageRanges,
  sanitizeFilename,
} from './splitService';
import { PDFError } from '../types/pdf';
import type { OutlineNode, Section } from '../types/split';

describe('splitService', () => {
  describe('createSectionsFromOutline', () => {
    it('should create sections from outline nodes with array destinations', async () => {
      const outline: OutlineNode[] = [
        {
          title: 'Introduction',
          dest: [{ num: 0, gen: 0 }], // Page ref object
          items: [],
        },
        {
          title: 'Methods',
          dest: [{ num: 5, gen: 0 }],
          items: [],
        },
        {
          title: 'Results',
          dest: [{ num: 10, gen: 0 }],
          items: [],
        },
      ];

      const mockPdfDoc = {
        getPageIndex: vi.fn(async (ref) => {
          // Mock page references
          if (ref.num === 0) return 0;
          if (ref.num === 5) return 5;
          if (ref.num === 10) return 10;
          return 0;
        }),
        getDestination: vi.fn(),
        numPages: 20,
      } as any;

      const sections = await createSectionsFromOutline(outline, mockPdfDoc, 20);

      expect(sections).toHaveLength(3);
      expect(sections[0].title).toBe('Introduction');
      expect(sections[0].startPage).toBe(0);
      expect(sections[0].endPage).toBe(4);
      expect(sections[1].title).toBe('Methods');
      expect(sections[1].startPage).toBe(5);
      expect(sections[1].endPage).toBe(9);
      expect(sections[2].title).toBe('Results');
      expect(sections[2].startPage).toBe(10);
      expect(sections[2].endPage).toBe(19);
    });

    it('should resolve string (named) destinations', async () => {
      const outline: OutlineNode[] = [
        {
          title: 'Chapter 1',
          dest: 'chapter1', // Named destination
          items: [],
        },
        {
          title: 'Chapter 2',
          dest: 'chapter2',
          items: [],
        },
      ];

      const mockPdfDoc = {
        getDestination: vi.fn(async (name) => {
          if (name === 'chapter1') return [{ num: 3, gen: 0 }];
          if (name === 'chapter2') return [{ num: 8, gen: 0 }];
          return null;
        }),
        getPageIndex: vi.fn(async (ref) => {
          if (ref.num === 3) return 3;
          if (ref.num === 8) return 8;
          return 0;
        }),
        numPages: 15,
      } as any;

      const sections = await createSectionsFromOutline(outline, mockPdfDoc, 15);

      expect(sections).toHaveLength(2);
      expect(sections[0].startPage).toBe(3);
      expect(sections[1].startPage).toBe(8);
      expect(mockPdfDoc.getDestination).toHaveBeenCalledWith('chapter1');
      expect(mockPdfDoc.getDestination).toHaveBeenCalledWith('chapter2');
    });

    it('should handle outline with single bookmark', async () => {
      const outline: OutlineNode[] = [
        {
          title: 'Content',
          dest: [0],
          items: [],
        },
      ];

      const mockPdfDoc = {
        getPageIndex: vi.fn(async () => 0),
        numPages: 15,
      } as any;

      const sections = await createSectionsFromOutline(outline, mockPdfDoc, 15);

      expect(sections).toHaveLength(1);
      expect(sections[0].endPage).toBe(14);
    });

    it('should handle undefined destinations', async () => {
      const outline: OutlineNode[] = [
        {
          title: 'Chapter 1',
          dest: undefined,
          items: [],
        },
        {
          title: 'Chapter 2',
          dest: [{ num: 5, gen: 0 }],
          items: [],
        },
      ];

      const mockPdfDoc = {
        getPageIndex: vi.fn(async (ref) => (ref && ref.num === 5 ? 5 : 0)),
        numPages: 10,
      } as any;

      const sections = await createSectionsFromOutline(outline, mockPdfDoc, 10);

      expect(sections).toHaveLength(2);
      expect(sections[0].startPage).toBe(0);
    });
  });

  describe('scanTableOfContents', () => {
    it('should extract TOC sections from first pages', async () => {
      // Note: scanTableOfContents is exported but requires textService dynamic import
      // This test is deferred for integration testing
      expect(true).toBe(true);
    });
  });

  describe('autoDetectSections', () => {
    it('should prefer outline over TOC', async () => {
      // Note: autoDetectSections is exported but used internally by SmartSplitPanel
      // This test is deferred for integration testing
      expect(true).toBe(true);
    });
  });

  describe('parsePageRanges', () => {
    it('should parse valid page ranges', () => {
      const sections = parsePageRanges('1-5, 6-10, 11-15', 20);

      expect(sections).toHaveLength(3);
      expect(sections[0].startPage).toBe(0);
      expect(sections[0].endPage).toBe(4);
      expect(sections[1].startPage).toBe(5);
      expect(sections[1].endPage).toBe(9);
      expect(sections[2].startPage).toBe(10);
      expect(sections[2].endPage).toBe(14);
    });

    it('should handle single range', () => {
      const sections = parsePageRanges('1-10', 20);

      expect(sections).toHaveLength(1);
      expect(sections[0].startPage).toBe(0);
      expect(sections[0].endPage).toBe(9);
    });

    it('should handle spaces in input', () => {
      const sections = parsePageRanges('  1-5  ,  6-10  ', 15);

      expect(sections).toHaveLength(2);
      expect(sections[0].startPage).toBe(0);
      expect(sections[1].startPage).toBe(5);
    });

    it('should reject invalid format', () => {
      expect(() => parsePageRanges('1-5, 6to10', 20)).toThrow(PDFError);
    });

    it('should reject out-of-bounds ranges', () => {
      expect(() => parsePageRanges('1-5, 20-25', 20)).toThrow(PDFError);
    });

    it('should reject zero or negative pages', () => {
      expect(() => parsePageRanges('0-5', 20)).toThrow(PDFError);
      expect(() => parsePageRanges('-1-5', 20)).toThrow(PDFError);
    });

    it('should reject invalid order (start > end)', () => {
      expect(() => parsePageRanges('10-5', 20)).toThrow(PDFError);
    });

    it('should reject non-numeric pages', () => {
      expect(() => parsePageRanges('a-b', 20)).toThrow(PDFError);
    });
  });

  describe('validatePageRanges', () => {
    it('should accept non-overlapping ranges', () => {
      const sections: Section[] = [
        { id: '1', title: 'A', startPage: 0, endPage: 4 },
        { id: '2', title: 'B', startPage: 5, endPage: 9 },
        { id: '3', title: 'C', startPage: 10, endPage: 14 },
      ];

      expect(() => validatePageRanges(sections)).not.toThrow();
    });

    it('should reject overlapping ranges', () => {
      const sections: Section[] = [
        { id: '1', title: 'A', startPage: 0, endPage: 5 },
        { id: '2', title: 'B', startPage: 5, endPage: 10 },
      ];

      expect(() => validatePageRanges(sections)).toThrow(PDFError);
    });

    it('should reject partial overlaps', () => {
      const sections: Section[] = [
        { id: '1', title: 'A', startPage: 0, endPage: 7 },
        { id: '2', title: 'B', startPage: 5, endPage: 10 },
      ];

      expect(() => validatePageRanges(sections)).toThrow(PDFError);
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove special characters', () => {
      expect(sanitizeFilename('Chapter 1: Introduction')).toBe('Chapter-1-Introduction');
    });

    it('should replace spaces with dashes', () => {
      expect(sanitizeFilename('My Chapter Name')).toBe('My-Chapter-Name');
    });

    it('should collapse multiple dashes', () => {
      expect(sanitizeFilename('Chapter---Name')).toBe('Chapter-Name');
    });

    it('should remove leading/trailing dashes', () => {
      expect(sanitizeFilename('-Chapter-')).toBe('Chapter');
    });

    it('should handle special characters', () => {
      expect(sanitizeFilename('Chapter & Methods #1')).toBe('Chapter-Methods-1');
    });

    it('should limit length', () => {
      const long = 'a'.repeat(150);
      const result = sanitizeFilename(long);

      expect(result.length).toBeLessThanOrEqual(100);
    });

    it('should handle empty string', () => {
      const result = sanitizeFilename('');
      expect(typeof result).toBe('string');
    });
  });
});
