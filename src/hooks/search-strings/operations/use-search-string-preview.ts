
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
          .filter(word => !['and', 'the', 'with', 'from', 'this', 'that', 'have', 'been', 'would'].includes(word.toLowerCase()))
          .slice(0, 10);
        
        if (type === 'recruiting') {
          prompt = `(${words.join(' OR ')}) AND ("resume" OR "CV" OR "curriculum vitae")`;
        } else {
          prompt = `(${words.join(' OR ')}) AND ("company" OR "business" OR "enterprise")`;
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
