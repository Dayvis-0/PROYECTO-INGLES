/**
 * Cleans a string for comparison: lowercase, remove punctuation, normalize whitespace.
 */
export function cleanCompare(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
