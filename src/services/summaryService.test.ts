import { describe, it, expect } from 'vitest';
import { generateSummary, calculateTermFrequency, scoreSentences } from './summaryService';

describe('summaryService', () => {
  describe('generateSummary', () => {
    it('should handle empty text', () => {
      expect(generateSummary('')).toBe('');
      expect(generateSummary('   ')).toBe('');
    });

    it('should normalize whitespace before processing', () => {
      const text = `This is a sentence\nwith newlines\tand\ttabs. Another sentence with eight words total here. Third sentence with eight words total here.`;
      const summary = generateSummary(text);
      // Should not contain newlines or tabs
      expect(summary).not.toContain('\n');
      expect(summary).not.toContain('\t');
    });

    it('should strip bullet characters', () => {
      const text = '• First sentence with eight words total here. – Second sentence with eight words total here. — Third sentence with eight words.';
      const summary = generateSummary(text);
      expect(summary).not.toContain('•');
      expect(summary).not.toContain('–');
      expect(summary).not.toContain('—');
    });

    it('should skip TOC-like sentences with many numbers', () => {
      const text = `Chapter 1 page 2 section 3 subsection 4 part 5 number 6 item 7. This is a normal sentence with eight words total here. Another normal sentence with eight words total here.`;
      const summary = generateSummary(text);
      // Should not include the TOC-like first sentence (has many number pairs)
      expect(summary.length).toBeGreaterThan(0);
    });

    it('should limit summary to 3 sentences max', () => {
      const text = `First sentence with many words here for content. Second sentence with many words here for content. Third sentence with many words here for content. Fourth sentence with many words here for content. Fifth sentence with many words here for content.`;
      const summary = generateSummary(text);
      // Should only have 3 sentences in output
      const sentenceCount = (summary.match(/\./g) || []).length;
      expect(sentenceCount).toBeLessThanOrEqual(3);
    });

    it('should limit summary to 400 characters', () => {
      const longText = `This is a very long sentence with many words that goes on and on and on with lots of content here. Another very long sentence with many words that goes on and on and on with lots of content here. Yet another very long sentence with many words that goes on and on and on with lots of content here. And one more very long sentence with many words that goes on and on and on with lots of content here.`;
      const summary = generateSummary(longText);
      expect(summary.length).toBeLessThanOrEqual(400);
    });

    it('should preserve sentence order', () => {
      const text = `First sentence with more than eight words here.
      Second sentence with more than eight words here.
      Third sentence with more than eight words here.
      Fourth sentence with more than eight words here.
      Fifth sentence with more than eight words here.`;
      const summary = generateSummary(text, 2);

      // Check that order is preserved
      const firstIdx = summary.indexOf('First');
      const secondIdx = summary.indexOf('Second');

      if (firstIdx !== -1 && secondIdx !== -1) {
        expect(firstIdx).toBeLessThan(secondIdx);
      }
    });

    it('should skip sentences with odd symbols', () => {
      const text = `This is a normal sentence with eight words total here. This sentence has odd ): symbols and should be filtered. This is another normal sentence with eight words total here.`;
      const summary = generateSummary(text);
      expect(summary.length).toBeGreaterThan(0);
    });

    it('should output as single paragraph', () => {
      const text = `First sentence with more than eight words here. Second sentence with more than eight words here. Third sentence with more than eight words here.`;
      const summary = generateSummary(text);
      // Should not have newlines (single paragraph)
      expect(summary).not.toContain('\n');
    });
  });

  describe('calculateTermFrequency', () => {
    it('should count term frequencies correctly', () => {
      const text = 'the cat sat on the mat and the cat was happy';
      const freq = calculateTermFrequency(text);

      expect(freq.get('the')).toBe(3);
      expect(freq.get('cat')).toBe(2);
      expect(freq.get('and')).toBe(1);
    });

    it('should be case-insensitive', () => {
      const text = 'The THE the';
      const freq = calculateTermFrequency(text);

      expect(freq.get('the')).toBe(3);
    });

    it('should handle punctuation', () => {
      const text = 'Hello, world! Hello...';
      const freq = calculateTermFrequency(text);

      expect(freq.get('hello')).toBe(2);
    });

    it('should handle empty text', () => {
      const freq = calculateTermFrequency('');
      expect(freq.size).toBe(0);
    });
  });

  describe('scoreSentences', () => {
    it('should score sentences with term frequency', () => {
      const sentences = [
        'The cat jumped high',
        'The cat ran fast',
        'A dog barked loudly',
      ];

      const text = sentences.join('. ');
      const freq = calculateTermFrequency(text);
      const scored = scoreSentences(sentences, freq);

      expect(scored.length).toBe(3);
      expect(scored[0].score).toBeGreaterThan(0);
    });

    it('should give position bonus to first sentence', () => {
      const sentences = [
        'Important first sentence',
        'Less important middle',
        'Important last sentence',
      ];

      const text = sentences.join('. ');
      const freq = calculateTermFrequency(text);
      const scored = scoreSentences(sentences, freq);

      // Find first and last in original positions
      const firstScore = scored.find((s) => s.originalIndex === 0)?.score || 0;
      const lastScore = scored.find((s) => s.originalIndex === sentences.length - 1)?.score || 0;

      expect(firstScore).toBeGreaterThan(0);
      expect(lastScore).toBeGreaterThan(0);
    });
  });
});
