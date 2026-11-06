/**
 * Generate extractive summary from text using term frequency and position
 * @param text - Input text to summarize
 * @param maxSentences - Maximum sentences in summary (default: 3)
 * @returns Summary text (up to 400 chars, as one paragraph)
 */
export const generateSummary = (text: string, maxSentences: number = 3): string => {
  if (!text || text.trim().length === 0) {
    return '';
  }

  // Normalize whitespace: replace newlines/tabs/multiple spaces, strip bullets
  const normalized = normalizeWhitespace(text);

  // Split into sentences
  const sentences = splitSentences(normalized);

  if (sentences.length === 0) {
    return '';
  }

  // For very short text, return as-is
  if (sentences.length <= 2) {
    return normalized.substring(0, 400);
  }

  // Calculate term frequency
  const termFreq = calculateTermFrequency(normalized);

  // Score and select top sentences, filtering for TOC-like text
  const scoredSentences = scoreSentences(sentences, termFreq);
  const topSentences = scoredSentences
    .slice(0, Math.min(maxSentences, sentences.length))
    .filter((s) => !isTableOfContents(s.sentence))
    .sort((a, b) => a.originalIndex - b.originalIndex)
    .map((s) => s.sentence);

  // Join into one paragraph and limit to 400 chars by dropping sentences
  const result: string[] = [];
  let currentLength = 0;

  for (const sentence of topSentences) {
    const sentenceWithSpace = result.length === 0 ? sentence : ` ${sentence}`;
    const newLength = currentLength + sentenceWithSpace.length;

    if (newLength <= 400) {
      result.push(sentence);
      currentLength = newLength;
    } else {
      break; // Stop adding sentences once we'd exceed 400 chars
    }
  }

  return result.join(' ');
};

/**
 * Normalize whitespace: collapse newlines/tabs/spaces, strip bullets
 */
const normalizeWhitespace = (text: string): string => {
  return text
    .replace(/[\n\r\t]+/g, ' ') // Replace newlines/tabs with space
    .replace(/\s+/g, ' ')       // Collapse multiple spaces
    .replace(/[•–—]/g, '')      // Strip bullet characters
    .trim();
};

/**
 * Check if sentence looks like table of contents
 * Skip if >20% of tokens are numbers or contains 3+ "word number" pairs
 */
const isTableOfContents = (sentence: string): boolean => {
  const tokens = sentence.split(/\s+/).filter((t) => t.length > 0);
  if (tokens.length === 0) return false;

  // Count numeric tokens
  const numericTokens = tokens.filter((t) => /^\d+$/.test(t)).length;
  const numericRatio = numericTokens / tokens.length;
  if (numericRatio > 0.2) return true;

  // Count "word number" pairs
  let wordNumberPairs = 0;
  for (let i = 0; i < tokens.length - 1; i++) {
    if (/^\d+$/.test(tokens[i + 1]) && /^\w+$/.test(tokens[i])) {
      wordNumberPairs++;
    }
  }
  if (wordNumberPairs >= 3) return true;

  return false;
};

/**
 * Split text into sentences
 */
const splitSentences = (text: string): string[] => {
  // Split on . ! ? followed by space/newline, keep punctuation
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && countWords(s) >= 8 && !hasOddSymbols(s) && !isTableOfContents(s));

  return sentences;
};

/**
 * Count words in a sentence
 */
const countWords = (sentence: string): number => {
  return sentence.split(/\s+/).filter((w) => w.length > 0).length;
};

/**
 * Check if sentence contains odd symbols like "):"
 */
const hasOddSymbols = (sentence: string): boolean => {
  // Look for odd symbol combinations like "):" at sentence level
  return /\):|:\)|[\[\]()]+:/.test(sentence);
};

/**
 * Calculate term frequency in text
 */
export const calculateTermFrequency = (text: string): Map<string, number> => {
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^\w]/g, ''))
    .filter((w) => w.length > 0);

  const freq = new Map<string, number>();
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }

  return freq;
};

interface ScoredSentence {
  sentence: string;
  score: number;
  originalIndex: number;
}

/**
 * Score sentences by term frequency and position
 */
export const scoreSentences = (
  sentences: string[],
  termFreq: Map<string, number>
): ScoredSentence[] => {
  const scored: ScoredSentence[] = sentences.map((sentence, index) => {
    // Calculate term frequency score
    const words = sentence
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.replace(/[^\w]/g, ''))
      .filter((w) => w.length > 0);

    let tfScore = 0;
    for (const word of words) {
      tfScore += termFreq.get(word) || 0;
    }

    // Normalize by sentence length
    tfScore = words.length > 0 ? tfScore / words.length : 0;

    // Position bonus: first and last sentences get +20%
    let positionBonus = 1.0;
    if (index === 0 || index === sentences.length - 1) {
      positionBonus = 1.2;
    }

    return {
      sentence,
      score: tfScore * positionBonus,
      originalIndex: index,
    };
  });

  return scored.sort((a, b) => b.score - a.score);
};
