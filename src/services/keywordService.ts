const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
  'those', 'i', 'you', 'your', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
  'who', 'when', 'where', 'why', 'how', 'if', 'it', 'not', 'no', 'yes',
  'so', 'up', 'down', 'out', 'all', 'each', 'every', 'both', 'few', 'more',
  'some', 'any', 'other', 'such', 'much', 'even', 'just', 'our', 'us',
]);

/**
 * Extract top keywords from text
 * @param text - Input text
 * @param maxKeywords - Maximum number of keywords (default: 8)
 * @returns Array of keywords sorted by frequency
 */
export const extractKeywords = (text: string, maxKeywords: number = 8): string[] => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Tokenize and clean
  const words = tokenize(text);

  // Remove stop words
  const filtered = removeStopWords(words);

  if (filtered.length === 0) {
    return [];
  }

  // Calculate frequency
  const freq = getWordFrequency(filtered);

  // Get top keywords
  const sorted = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, Math.max(3, maxKeywords))
    .map(([word]) => word);

  return sorted;
};

/**
 * Tokenize text into words
 */
const tokenize = (text: string): string[] => {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/[^\w]/g, ''))
    .filter((word) => word.length > 0);
};

/**
 * Remove stop words from word list
 */
export const removeStopWords = (words: string[]): string[] => {
  return words.filter((word) => !STOP_WORDS.has(word));
};

/**
 * Calculate word frequency, merging simple plurals
 */
export const getWordFrequency = (words: string[]): Map<string, number> => {
  const freq = new Map<string, number>();

  for (const word of words) {
    // Skip very short words and numbers
    if (word.length < 3 || /^\d+$/.test(word)) {
      continue;
    }

    // Normalize plurals: remove 's' if it ends with 's' and base word is valid
    let normalized = word;
    if (word.endsWith('s') && word.length > 3) {
      const singular = word.slice(0, -1);
      // Only merge if singular form is in frequency map or base is substantial
      if (singular.length >= 3 && !singular.endsWith('s')) {
        normalized = singular;
      }
    }

    freq.set(normalized, (freq.get(normalized) || 0) + 1);
  }

  return freq;
};
