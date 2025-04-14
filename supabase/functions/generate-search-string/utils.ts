
export function extractKeywordsAndPhrases(text: string): string[] {
  if (!text || text.trim().length === 0) {
    console.log('Empty text provided to extractKeywordsAndPhrases');
    return [];
  }

  // Check if text is too short before processing
  if (text.trim().length < 10) {
    console.log(`Text too short (${text.length} chars) to extract meaningful keywords`);
    return [];
  }

  try {
    console.log(`Extracting keywords from text (${text.length} chars)`);
    
    // Extract keywords and phrases from text
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
      .split(/\s+/)              // Split by whitespace
      .filter(word => word.length > 3 && !commonWords.includes(word)); // Filter out short words and common words
    
    console.log(`Found ${words.length} potential keywords after filtering`);
    
    // Count word frequency
    const wordCounts: Record<string, number> = {};
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    // If we have very few keywords, lower the threshold for word length
    if (Object.keys(wordCounts).length < 5) {
      console.log('Few keywords found, including shorter words');
      const shortWords = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !commonWords.includes(word));
      
      shortWords.forEach(word => {
        if (!wordCounts[word]) {
          wordCounts[word] = 1;
        }
      });
    }
    
    // Get top keywords by frequency
    const keywords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(entry => entry[0]);
    
    console.log(`Returning ${keywords.length} keywords`);
    
    // Fallback if we couldn't extract keywords
    if (keywords.length === 0) {
      console.log('No keywords found, using fallback');
      // Return a more descriptive message when no keywords can be found
      return [];
    }
    
    return keywords;
  } catch (error) {
    console.error('Error in extractKeywordsAndPhrases:', error);
    return []; // Return empty array in case of error
  }
}

// Common words to filter out when extracting keywords
export const commonWords = [
  'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but',
  'his', 'they', 'say', 'her', 'she', 'will', 'from', 'what', 'make', 'when',
  'can', 'more', 'like', 'time', 'just', 'know', 'people', 'year', 'your', 'than',
  'then', 'some', 'now', 'very', 'über', 'auch', 'sind', 'eine', 'oder', 'wir',
  'wird', 'sein', 'einen', 'dem', 'mehr', 'wurde', 'können', 'hat', 'als', 'zur',
  'sie', 'sollen', 'must', 'können', 'muss', 'soll', 'sollte', 'müssen', 'haben',
  'unser', 'unsere', 'ihre', 'ihr', 'ihren', 'seiner', 'seine', 'seinen', 'unserem',
  'about', 'after', 'all', 'also', 'any', 'back', 'been', 'before', 'both', 'could',
  'does', 'down', 'even', 'every', 'first', 'good', 'great', 'had', 'has', 'here',
  'how', 'into', 'its', 'just', 'look', 'most', 'much', 'must', 'new', 'only',
  'other', 'our', 'over', 'same', 'see', 'should', 'such', 'take', 'there', 'these',
  'thing', 'think', 'those', 'through', 'too', 'under', 'upon', 'use', 'was', 'way',
  'well', 'were', 'what', 'where', 'which', 'while', 'who', 'with', 'would'
];
