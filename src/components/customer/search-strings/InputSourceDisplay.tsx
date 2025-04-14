
import React from 'react';
import { SearchString } from '@/hooks/search-strings/search-string-types';
import { ExternalLink } from 'lucide-react';

interface InputSourceDisplayProps {
  searchString: SearchString;
}

const InputSourceDisplay: React.FC<InputSourceDisplayProps> = ({ searchString }) => {
  const truncate = (str: string | undefined, length: number) => {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
  };

  const getFilename = (path: string | undefined) => {
    if (!path) return '';
    return path.split('/').pop() || path;
  };

  return (
    <div className="mb-2">
      {searchString.input_source === 'text' && (
        <div className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Input: </span>
          {truncate(searchString.input_text, 100)}
        </div>
      )}
      
      {searchString.input_source === 'website' && (
        <div className="text-sm text-gray-600 mb-2 flex items-center gap-1">
          <span className="font-medium">URL: </span>
          <a 
            href={searchString.input_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            {truncate(searchString.input_url, 60)}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
      
      {searchString.input_source === 'pdf' && (
        <div className="text-sm text-gray-600 mb-2">
          <span className="font-medium">PDF: </span>
          {getFilename(searchString.input_pdf_path)}
        </div>
      )}
    </div>
  );
};

export default InputSourceDisplay;
