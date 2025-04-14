
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SearchStringSource } from '@/hooks/search-strings/search-string-types';
import { AlignJustify, Globe, FileText } from 'lucide-react';

interface SourceBadgeProps {
  source: SearchStringSource;
}

const SourceBadge: React.FC<SourceBadgeProps> = ({ source }) => {
  const getSourceIcon = (source: SearchStringSource) => {
    switch (source) {
      case 'text':
        return <AlignJustify className="h-4 w-4" />;
      case 'website':
        return <Globe className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      {getSourceIcon(source)}
      <span>
        {source === 'text' ? 'Text' : 
         source === 'website' ? 'Website' : 'PDF'}
      </span>
    </Badge>
  );
};

export default SourceBadge;
