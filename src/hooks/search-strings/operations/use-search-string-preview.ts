
import { SearchStringType, SearchStringSource } from '../search-string-types';

export const useSearchStringPreview = () => {
  const generatePreview = async (
    type: SearchStringType,
    inputSource: SearchStringSource,
    inputText?: string,
    inputUrl?: string,
    pdfFile?: File | null
  ): Promise<string> => {
    try {
      let prompt = '';
      
      if (inputSource === 'text' && inputText) {
        // Extract meaningful keywords from the input text
        const words = inputText.split(/\s+/)
          .filter(word => word.length > 3)
          .filter(word => !['and', 'the', 'with', 'from', 'this', 'that', 'have', 'been', 'would', 'oder', 'und', 'für', 'mit', 'in'].includes(word.toLowerCase()));
        
        // Remove duplicate words (case insensitive)
        const uniqueWords = Array.from(new Set(words.map(word => word.toLowerCase())))
          .map(lowercaseWord => {
            // Find the original word with original casing
            return words.find(word => word.toLowerCase() === lowercaseWord) || lowercaseWord;
          });
        
        // Group words by semantic concepts (e.g. job title, location)
        const jobTitles: string[] = [];
        const locations: string[] = [];
        const skills: string[] = [];
        const otherTerms: string[] = [];
        
        // Simple pattern matching for job titles and locations
        const jobPatterns = [/buchhalter/i, /finanz/i, /accountant/i, /controller/i];
        const locationPatterns = [/berlin/i, /hamburg/i, /münchen/i, /frankfurt/i, /köln/i];
        
        uniqueWords.forEach(word => {
          const wordLower = word.toLowerCase();
          
          if (jobPatterns.some(pattern => pattern.test(wordLower))) {
            jobTitles.push(word);
          } else if (locationPatterns.some(pattern => pattern.test(wordLower))) {
            locations.push(word);
          } else {
            otherTerms.push(word);
          }
        });
        
        // Create search string with proper Boolean logic
        if (type === 'recruiting') {
          const parts: string[] = [];
          
          // Add job titles if found
          if (jobTitles.length > 0) {
            parts.push(jobTitles.length > 1 ? `(${jobTitles.join(' OR ')})` : jobTitles[0]);
          }
          
          // Add locations if found
          if (locations.length > 0) {
            parts.push(locations.length > 1 ? `(${locations.join(' OR ')})` : locations[0]);
          }
          
          // Add other terms if we didn't find any specific categories
          if (parts.length === 0 && otherTerms.length > 0) {
            parts.push(otherTerms.length > 1 ? `(${otherTerms.join(' OR ')})` : otherTerms[0]);
          }
          
          // Join all parts with AND
          const mainQuery = parts.join(' AND ');
          
          // Add recruiting-specific suffixes
          prompt = `${mainQuery} AND ("resume" OR "CV" OR "curriculum vitae")`;
        } else {
          // Lead generation follows similar pattern but with different suffixes
          const parts: string[] = [];
          
          // Add any keywords we found
          if (uniqueWords.length > 0) {
            if (jobTitles.length > 0) {
              parts.push(jobTitles.length > 1 ? `(${jobTitles.join(' OR ')})` : jobTitles[0]);
            }
            
            if (locations.length > 0) {
              parts.push(locations.length > 1 ? `(${locations.join(' OR ')})` : locations[0]);
            }
            
            if (otherTerms.length > 0 && parts.length === 0) {
              parts.push(otherTerms.length > 1 ? `(${otherTerms.join(' OR ')})` : otherTerms[0]);
            }
            
            const mainQuery = parts.join(' AND ');
            prompt = `${mainQuery} AND ("company" OR "business" OR "enterprise")`;
          } else {
            prompt = `(${uniqueWords.join(' OR ')}) AND ("company" OR "business" OR "enterprise")`;
          }
        }
      } else if (inputSource === 'website' && inputUrl) {
        try {
          const domain = new URL(inputUrl).hostname.replace('www.', '');
          
          if (type === 'recruiting') {
            prompt = `Analyzing job listing from ${domain}...\n\nExtracting job requirements, skills, qualifications, and other details to generate a comprehensive Boolean search string.\n\nThis will create a search string optimized for finding candidates with the exact skills and experience needed for this role.`;
          } else {
            prompt = `Analyzing business website ${domain}...\n\nExtracting company information, industry details, products/services, and target market to generate a comprehensive Boolean search string.\n\nThis will create a search string optimized for finding potential business leads and decision makers in this industry.`;
          }
        } catch (error) {
          console.error('Invalid URL format:', error);
          prompt = `Invalid URL format. Please enter a valid URL.`;
        }
      } else if (inputSource === 'pdf' && pdfFile) {
        const fileSize = Math.round(pdfFile.size / 1024); // KB
        
        if (type === 'recruiting') {
          prompt = `Analyzing job description PDF (${fileSize}KB): ${pdfFile.name}...\n\nExtracting job requirements, skills, qualifications, and other details to generate a comprehensive Boolean search string.\n\nThis will create a search string optimized for finding candidates with the exact skills and experience needed for this role.`;
        } else {
          prompt = `Analyzing business document PDF (${fileSize}KB): ${pdfFile.name}...\n\nExtracting company information, industry details, products/services, and target market to generate a comprehensive Boolean search string.\n\nThis will create a search string optimized for finding potential business leads and decision makers in this industry.`;
        }
      }
      
      return prompt;
    } catch (error) {
      console.error('Error generating preview:', error);
      return 'Preparing to generate search string...';
    }
  };

  return {
    generatePreview
  };
};
