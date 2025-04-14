
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Copy, Trash2, RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { SearchString } from '@/hooks/search-strings/search-string-types';
import { useToast } from '@/hooks/use-toast';

interface SearchStringActionsProps {
  searchString: SearchString;
  onOpenDetail: (searchString: SearchString) => void;
  onDelete: (id: string) => Promise<void>;
  onRetry: (searchString: SearchString) => Promise<void>;
}

const SearchStringActions: React.FC<SearchStringActionsProps> = ({ 
  searchString, 
  onOpenDetail, 
  onDelete,
  onRetry
}) => {
  const { toast } = useToast();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleCopy = () => {
    if (!searchString.generated_string) return;
    
    navigator.clipboard.writeText(searchString.generated_string);
    toast({
      title: 'Copied to clipboard',
      description: 'Search string has been copied to your clipboard',
    });
  };

  const handleRetry = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isRetrying) return;
    
    try {
      setIsRetrying(true);
      
      if (onRetry) {
        await onRetry(searchString);
        toast({
          title: "Processing started",
          description: "The search string is being processed again.",
        });
      }
    } catch (error) {
      console.error('Error retrying search string:', error);
      toast({
        title: "Retry failed",
        description: "There was an error retrying the search string. Please try again with more content.",
        variant: "destructive"
      });
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="flex gap-2 mt-3">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onOpenDetail(searchString)}
        className="text-xs"
      >
        <Edit className="h-3 w-3 mr-1" />
        View Details
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleCopy}
        className="text-xs"
        disabled={!searchString.generated_string}
      >
        <Copy className="h-3 w-3 mr-1" />
        Copy
      </Button>
      
      {searchString.status === 'failed' && (
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs text-blue-600"
          onClick={handleRetry}
          disabled={isRetrying}
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Retrying...' : 'Retry'}
        </Button>
      )}
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this search string. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDelete(searchString.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SearchStringActions;
