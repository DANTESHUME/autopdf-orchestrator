import { describe, it, expect } from 'vitest';
import { generateMarkdown, generatePDFFilename } from './exportService';
import type { ProcessedSection } from '../types/split';

describe('exportService', () => {
  describe('generateMarkdown', () => {
    it('should generate markdown from sections', () => {
      const sections: ProcessedSection[] = [
        {
          id: '1',
          title: 'Introduction',
          startPage: 0,
          endPage: 4,
          text: 'intro text',
          summary: 'This is a summary.',
          keywords: ['intro', 'overview'],
        },
        {
          id: '2',
          title: 'Methods',
          startPage: 5,
          endPage: 9,
          text: 'methods text',
          summary: 'Methods were described.',
          keywords: ['method', 'approach'],
        },
      ];

      const markdown = generateMarkdown(sections);

      expect(markdown).toContain('# PDF Section Notes');
      expect(markdown).toContain('## Section 1: Introduction');
      expect(markdown).toContain('## Section 2: Methods');
      expect(markdown).toContain('This is a summary.');
      expect(markdown).toContain('intro, overview');
      // Should have Pages line for named sections
      expect(markdown).toContain('**Pages**: 1-5');
      expect(markdown).toContain('**Pages**: 6-10');
    });

    it('should render generic "Section N" title with page range (no Pages line)', () => {
      const sections: ProcessedSection[] = [
        {
          id: '1',
          title: 'Section 1',
          startPage: 0,
          endPage: 4,
          text: 'text',
          summary: 'Summary.',
          keywords: ['key'],
        },
      ];

      const markdown = generateMarkdown(sections);

      // Should render as "Section 1 (pages 1-5)" without repeating the title
      expect(markdown).toContain('## Section 1 (pages 1-5)');
      expect(markdown).not.toContain('## Section 1: Section 1');
      // Should NOT have redundant Pages line
      expect(markdown.split('**Pages**').length).toBe(1); // Only the one in heading
    });

    it('should handle empty section titles with page range (no Pages line)', () => {
      const sections: ProcessedSection[] = [
        {
          id: '1',
          title: '',
          startPage: 2,
          endPage: 6,
          text: 'text',
          summary: 'Summary.',
          keywords: [],
        },
      ];

      const markdown = generateMarkdown(sections);

      // Empty title should render as "Section 1 (pages 3-7)"
      expect(markdown).toContain('## Section 1 (pages 3-7)');
      // Should NOT have Pages line since it's in the heading
      expect(markdown.split('**Pages**').length).toBe(1);
    });

    it('should handle sections without summary', () => {
      const sections: ProcessedSection[] = [
        {
          id: '1',
          title: 'Empty',
          startPage: 0,
          endPage: 4,
          text: '',
          summary: '',
          keywords: [],
        },
      ];

      const markdown = generateMarkdown(sections);

      expect(markdown).toContain('## Section 1: Empty');
      expect(markdown).not.toContain('### Summary');
      expect(markdown).not.toContain('### Keywords');
    });

    it('should handle empty sections array', () => {
      const markdown = generateMarkdown([]);

      expect(markdown).toContain('# PDF Section Notes');
      expect(markdown.split('---').length).toBeGreaterThan(1);
    });

    it('should format pages correctly (1-based) for named sections', () => {
      const sections: ProcessedSection[] = [
        {
          id: '1',
          title: 'Test',
          startPage: 0,
          endPage: 9,
          text: '',
          summary: '',
          keywords: [],
        },
      ];

      const markdown = generateMarkdown(sections);

      expect(markdown).toContain('**Pages**: 1-10');
    });
  });

  describe('generatePDFFilename', () => {
    it('should generate filename with title', () => {
      const filename = generatePDFFilename(1, 'Introduction', 1, 5);

      expect(filename).toContain('section-1');
      expect(filename).toContain('Introduction');
      expect(filename).toContain('.pdf');
    });

    it('should sanitize special characters in title', () => {
      const filename = generatePDFFilename(2, 'Chapter 2: Methods & Analysis', 6, 10);

      expect(filename).toContain('section-2');
      expect(filename).not.toContain(':');
      expect(filename).not.toContain('&');
      expect(filename).toContain('.pdf');
    });

    it('should use page ranges when title is empty', () => {
      const filename = generatePDFFilename(1, '', 1, 5);

      expect(filename).toContain('section-1');
      expect(filename).toContain('pages');
      expect(filename).toContain('1');
      expect(filename).toContain('5');
    });

    it('should use page ranges when title is only spaces', () => {
      const filename = generatePDFFilename(1, '   ', 1, 5);

      // When sanitized, title becomes empty
      expect(filename).toContain('section-1');
      expect(filename).toContain('pages');
    });
  });
});
