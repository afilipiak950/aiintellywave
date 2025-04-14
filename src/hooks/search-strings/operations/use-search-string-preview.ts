
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
        
        // Group words by semantic concepts
        // This is a simple approach - we'll assume words separated by spaces
        // are different concepts unless they appear to be part of the same phrase
        const groupedConcepts: string[][] = [];
        
        if (words.length > 0) {
          // Simple algorithm to identify if words are part of the same concept
          // For this example, we'll just check if they appear close to each other in the original text
          let currentText = inputText.toLowerCase();
          
          // Find position groups that might represent concepts
          words.forEach(word => {
            const wordPosition = currentText.indexOf(word.toLowerCase());
            if (wordPosition !== -1) {
              // Check if this word is part of an existing group or create a new one
              let addedToGroup = false;
              
              for (const group of groupedConcepts) {
                const lastWord = group[group.length - 1];
                const lastPosition = currentText.indexOf(lastWord.toLowerCase());
                
                // If words are close to each other, they might be part of the same concept
                if (Math.abs(wordPosition - lastPosition) < 15) {
                  group.push(word);
                  addedToGroup = true;
                  break;
                }
              }
              
              if (!addedToGroup) {
                groupedConcepts.push([word]);
              }
              
              // Remove the word from the text to avoid reusing it
              currentText = currentText.replace(word.toLowerCase(), ' '.repeat(word.length));
            }
          });
        }
        
        // If all words are individual concepts or no grouping was possible,
        // create groups based on input structure (looking for "in" or similar connectors)
        if (groupedConcepts.length === 0 || groupedConcepts.length === words.length) {
          const parts = inputText.toLowerCase().split(/\s+in\s+|\s+for\s+|\s+at\s+|\s+near\s+/);
          
          if (parts.length > 1) {
            // This might be a job title and location, like "Finanzbuchalter in Berlin"
            const jobPart = parts[0].trim().split(/\s+/).filter(w => w.length > 2);
            const locationPart = parts[1].trim().split(/\s+/).filter(w => w.length > 2);
            
            if (jobPart.length > 0) groupedConcepts.push(jobPart);
            if (locationPart.length > 0) groupedConcepts.push(locationPart);
          } else {
            // Fallback - just put each word in its own group
            groupedConcepts.push(...words.map(word => [word]));
          }
        }
        
        // Create search string with proper Boolean logic
        if (type === 'recruiting') {
          if (groupedConcepts.length > 0) {
            // Join words within each concept group with OR
            const conceptStrings = groupedConcepts.map(group => 
              group.length > 1 ? `(${group.join(' OR ')})` : group[0]
            );
            
            // Join concept groups with AND
            const conceptsString = conceptStrings.join(' AND ');
            
            // Add recruiting-specific suffixes
            prompt = `(${conceptsString}) AND ("resume" OR "CV" OR "curriculum vitae")`;
          } else {
            // Fallback for empty or invalid input
            prompt = `(${words.join(' OR ')}) AND ("resume" OR "CV" OR "curriculum vitae")`;
          }
        } else {
          // Lead generation follows similar pattern but with different suffixes
          if (groupedConcepts.length > 0) {
            const conceptStrings = groupedConcepts.map(group => 
              group.length > 1 ? `(${group.join(' OR ')})` : group[0]
            );
            const conceptsString = conceptStrings.join(' AND ');
            prompt = `(${conceptsString}) AND ("company" OR "business" OR "enterprise")`;
          } else {
            prompt = `(${words.join(' OR ')}) AND ("company" OR "business" OR "enterprise")`;
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
