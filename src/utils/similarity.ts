import { getWordLevenshtein } from "./levenshtein";

/**
 * Checks if two words are similar using Levenshtein distance.
 * Shorter words (<=4 chars) allow at most distance 1,
 * longer words allow up to distance 2.
 */
export function isWordSimilarityMatch(wordA: string, wordB: string): boolean {
  const cleanA = wordA.toLowerCase().trim();
  const cleanB = wordB.toLowerCase().trim();
  if (cleanA === cleanB) return true;

  const distance = getWordLevenshtein(cleanA, cleanB);
  if (cleanA.length <= 4) {
    return distance <= 1; // permit only slight variations on short words
  } else {
    return distance <= 2; // permit slightly more phonetic leeway on longer words
  }
}
