
import React from 'react';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface PreviewDisplayProps {
  isLoading: boolean;
  previewString: string | null;
  inputSource: string;
}

export const PreviewDisplay: React.FC<PreviewDisplayProps> = ({ 
  isLoading, 
  previewString, 
  inputSource 
}) => {
  if (isLoading) {
    return (
      <div className="border rounded-md p-4 bg-gray-50 flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm">Preparing preview...</span>
      </div>
    );
  }

  if (!previewString) {
    return null;
  }

  return (
    <div className="border rounded-md p-4 bg-gray-50">
      <Label>Preview</Label>
      <div className="whitespace-pre-line font-mono text-sm">{previewString}</div>
      {inputSource === 'website' && (
        <div className="mt-2 bg-yellow-50 p-2 rounded-md text-xs">
          ⚠️ This is just a preview. When you submit, the full website will be crawled, analyzed, and processed into a complete search string with all extracted details.
        </div>
      )}
    </div>
  );
};
