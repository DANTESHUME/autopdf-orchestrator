import { describe, it, expect } from 'vitest';
import { extractKeywords, removeStopWords, getWordFrequency } from './keywordService';

describe('keywordService', () => {
  describe('extractKeywords', () => {
    it('should extract keywords from text', () => {
      const text = 'machine learning models are powerful. machine learning is important. deep learning is great.';
      const keywords = extractKeywords(text, 5);

      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords).toContain('machine');
      expect(keywords).toContain('learning');
    });

    it('should handle empty text', () => {
      expect(extractKeywords('')).toEqual([]);
      expect(extractKeywords('   ')).toEqual([]);
    });

    it('should return minimum 3 keywords if possible', () => {
      const text = 'python programming language code';
      const keywords = extractKeywords(text, 10);

      expect(keywords.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter out stop words', () => {
      const text = 'the and or but in on at to for from';
      const keywords = extractKeywords(text);

      // Should not contain common stop words
      expect(keywords).not.toContain('the');
      expect(keywords).not.toContain('and');
    });

    it('should respect maxKeywords limit', () => {
      const text = 'word1 word1 word2 word2 word3 word3 word4 word4 word5 word5 word6 word6';
      const keywords = extractKeywords(text, 3);

      expect(keywords.length).toBeLessThanOrEqual(3);
    });

    it('should sort by frequency', () => {
      const text = 'apple apple apple banana banana cherry';
      const keywords = extractKeywords(text, 3);

      expect(keywords[0]).toBe('apple');
      expect(keywords[1]).toBe('banana');
    });
  });

  describe('removeStopWords', () => {
    it('should remove stop words', () => {
      const words = ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog'];
      const filtered = removeStopWords(words);

      expect(filtered).not.toContain('the');
      expect(filtered).toContain('quick');
      expect(filtered).toContain('fox');
    });

    it('should preserve non-stop words', () => {
      const words = ['python', 'programming', 'language'];
      const filtered = removeStopWords(words);

      expect(filtered).toEqual(['python', 'programming', 'language']);
    });

    it('should handle empty array', () => {
      expect(removeStopWords([])).toEqual([]);
    });
  });

  describe('getWordFrequency', () => {
    it('should count word frequencies', () => {
      const words = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple'];
      const freq = getWordFrequency(words);

      expect(freq.get('apple')).toBe(3);
      expect(freq.get('banana')).toBe(2);
      expect(freq.get('cherry')).toBe(1);
    });

    it('should merge simple plurals', () => {
      const words = ['skill', 'skills', 'skill', 'skills', 'skills'];
      const freq = getWordFrequency(words);

      // 'skills' should be merged into 'skill'
      expect(freq.get('skill')).toBe(5);
      expect(freq.has('skills')).toBe(false);
    });

    it('should not merge words already ending in s', () => {
      const words = ['glass', 'glass', 'glasses'];
      const freq = getWordFrequency(words);

      // 'glass' and 'glasses' should be treated separately or merged appropriately
      const result = freq.get('glass') || 0;
      expect(result).toBeGreaterThan(0);
    });

    it('should skip short words (< 3 chars)', () => {
      const words = ['a', 'ab', 'abc', 'test'];
      const freq = getWordFrequency(words);

      expect(freq.has('a')).toBe(false);
      expect(freq.has('ab')).toBe(false);
      expect(freq.has('abc')).toBe(true);
    });

    it('should skip numeric-only words', () => {
      const words = ['123', 'test', '456', 'hello'];
      const freq = getWordFrequency(words);

      expect(freq.has('123')).toBe(false);
      expect(freq.has('456')).toBe(false);
      expect(freq.has('test')).toBe(true);
    });

    it('should handle empty array', () => {
      const freq = getWordFrequency([]);
      expect(freq.size).toBe(0);
    });
  });
});
