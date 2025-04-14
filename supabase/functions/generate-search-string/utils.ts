
export function extractKeywordsAndPhrases(text: string): string[] {
  // Extract keywords and phrases from text
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
    .split(/\s+/)              // Split by whitespace
    .filter(word => word.length > 3 && !commonWords.includes(word)); // Filter out short words and common words
  
  // Count word frequency
  const wordCounts: Record<string, number> = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // Get top keywords by frequency
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(entry => entry[0]);
}

// Common words to filter out when extracting keywords
export const commonWords = [
  'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but',
  'his', 'they', 'say', 'her', 'she', 'will', 'from', 'what', 'make', 'when',
  'can', 'more', 'like', 'time', 'just', 'know', 'people', 'year', 'your', 'than',
  'then', 'some', 'now', 'very', 'über', 'auch', 'sind', 'eine', 'oder', 'wir',
  'wird', 'sein', 'einen', 'dem', 'mehr', 'wurde', 'können', 'hat', 'als', 'zur',
  'sie', 'sollen', 'must', 'können', 'muss', 'soll', 'sollte', 'müssen', 'haben',
  'unser', 'unsere', 'ihre', 'ihr', 'ihren', 'seiner', 'seine', 'seinen', 'unserem'
];
