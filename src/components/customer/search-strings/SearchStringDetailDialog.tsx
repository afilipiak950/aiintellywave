
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchString } from '@/hooks/search-strings/use-search-strings';
import { formatDistanceToNow } from 'date-fns';
import { LuCopy, LuExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SearchStringDetailDialogProps {
  searchString: SearchString;
  open: boolean;
  onClose: () => void;
}

const SearchStringDetailDialog: React.FC<SearchStringDetailDialogProps> = ({
  searchString,
  open,
  onClose,
}) => {
  const { toast } = useToast();

  const handleCopySearchString = () => {
    if (searchString.generated_string) {
      navigator.clipboard.writeText(searchString.generated_string);
      toast({
        title: 'Copied to clipboard',
        description: 'Search string has been copied to your clipboard',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="outline">New</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'completed':
        return <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'recruiting' ? 'Recruiting Campaign' : 'Lead Generation Campaign';
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'text':
        return 'Text Input';
      case 'website':
        return 'Website URL';
      case 'pdf':
        return 'PDF Document';
      default:
        return source;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getTypeLabel(searchString.type)} {getStatusBadge(searchString.status)}
          </DialogTitle>
          <DialogDescription>
            Created {formatDistanceToNow(new Date(searchString.created_at), { addSuffix: true })}
            {searchString.processed_at && (
              <span> • Processed {formatDistanceToNow(new Date(searchString.processed_at), { addSuffix: true })}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Source Information */}
          <div>
            <h3 className="text-sm font-medium mb-2">Source: {getSourceLabel(searchString.input_source)}</h3>
            
            {searchString.input_source === 'text' && searchString.input_text && (
              <div className="bg-muted p-4 rounded-md max-h-40 overflow-y-auto text-sm whitespace-pre-wrap">
                {searchString.input_text}
              </div>
            )}
            
            {searchString.input_source === 'website' && searchString.input_url && (
              <div className="flex items-center gap-2">
                <a 
                  href={searchString.input_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  {searchString.input_url}
                  <LuExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            
            {searchString.input_source === 'pdf' && searchString.input_pdf_path && (
              <div className="text-sm">PDF Document: {searchString.input_pdf_path.split('/').pop()}</div>
            )}
          </div>

          {/* Generated Search String */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Generated Search String</h3>
              
              {searchString.generated_string && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopySearchString}
                  className="h-8 flex items-center gap-1"
                >
                  <LuCopy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </Button>
              )}
            </div>
            
            {searchString.status === 'completed' && searchString.generated_string ? (
              <div className="bg-muted p-4 rounded-md max-h-60 overflow-y-auto text-sm whitespace-pre-wrap">
                {searchString.generated_string}
              </div>
            ) : (
              <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground">
                {searchString.status === 'processing' ? (
                  "Your search string is being generated. This may take a moment..."
                ) : (
                  "No search string generated yet."
                )}
              </div>
            )}
          </div>

          {/* Extracted Text (for PDF) */}
          {searchString.input_source === 'pdf' && searchString.input_text && (
            <div>
              <h3 className="text-sm font-medium mb-2">Extracted PDF Content</h3>
              <div className="bg-muted p-4 rounded-md max-h-40 overflow-y-auto text-sm whitespace-pre-wrap">
                {searchString.input_text}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SearchStringDetailDialog;
