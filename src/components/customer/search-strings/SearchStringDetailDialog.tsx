
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { SearchString } from '@/hooks/search-strings/use-search-strings';
import { Edit, Check, Copy, FileText, Globe, AlignJustify } from 'lucide-react';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedString, setEditedString] = useState(searchString.generated_string || '');

  const handleCopy = () => {
    navigator.clipboard.writeText(searchString.generated_string || '');
    toast({
      title: 'Copied to clipboard',
      description: 'Search string has been copied to your clipboard',
    });
  };

  const getSourceIcon = () => {
    switch (searchString.input_source) {
      case 'text':
        return <AlignJustify className="h-5 w-5 text-gray-500" />;
      case 'website':
        return <Globe className="h-5 w-5 text-gray-500" />;
      case 'pdf':
        return <FileText className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search String Details</DialogTitle>
          <DialogDescription>
            Created {formatDistanceToNow(new Date(searchString.created_at), { addSuffix: true })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant={searchString.type === 'recruiting' ? 'default' : 'secondary'}>
              {searchString.type === 'recruiting' ? 'Recruiting' : 'Lead Generation'}
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1">
              {getSourceIcon()}
              <span>
                {searchString.input_source === 'text' ? 'Text Input' : 
                 searchString.input_source === 'website' ? 'Website' : 'PDF Upload'}
              </span>
            </Badge>
            
            <Badge 
              className={
                searchString.status === 'completed' 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }
            >
              {searchString.status.charAt(0).toUpperCase() + searchString.status.slice(1)}
            </Badge>
          </div>

          {searchString.input_source === 'text' && searchString.input_text && (
            <div>
              <h3 className="text-sm font-medium mb-1">Input Text</h3>
              <div className="p-3 bg-gray-50 rounded-md border text-sm">
                {searchString.input_text}
              </div>
            </div>
          )}

          {searchString.input_source === 'website' && searchString.input_url && (
            <div>
              <h3 className="text-sm font-medium mb-1">Source URL</h3>
              <div className="p-3 bg-gray-50 rounded-md border text-sm overflow-x-auto">
                <a href={searchString.input_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {searchString.input_url}
                </a>
              </div>
            </div>
          )}

          {searchString.input_source === 'pdf' && searchString.input_pdf_path && (
            <div>
              <h3 className="text-sm font-medium mb-1">Source PDF</h3>
              <div className="p-3 bg-gray-50 rounded-md border text-sm">
                {searchString.input_pdf_path.split('/').pop()}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium">Generated Search String</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs h-6 px-2"
                >
                  {isEditing ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Done
                    </>
                  ) : (
                    <>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="text-xs h-6 px-2"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
            </div>

            {isEditing ? (
              <Textarea
                value={editedString}
                onChange={(e) => setEditedString(e.target.value)}
                className="font-mono text-sm"
                rows={6}
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                {searchString.generated_string || 'No search string generated yet.'}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {isEditing && (
            <Button onClick={() => setIsEditing(false)}>
              Save Changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SearchStringDetailDialog;
