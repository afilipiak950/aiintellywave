import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchString, useSearchStrings } from '@/hooks/search-strings/use-search-strings';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Trash2, Copy, FileText, Globe, AlignJustify, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SearchStringDetailDialog from './SearchStringDetailDialog';
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

interface SearchStringsListProps {
  onError?: (error: string | null) => void;
}

const SearchStringsList: React.FC<SearchStringsListProps> = ({ onError }) => {
  const { searchStrings, isLoading, deleteSearchString, updateSearchString, refetch } = useSearchStrings();
  const { toast } = useToast();
  const [selectedString, setSelectedString] = useState<SearchString | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLongPolling, setIsLongPolling] = useState(false);

  // Start long polling for processing search strings
  React.useEffect(() => {
    if (!searchStrings || searchStrings.length === 0) return;
    
    const processingStrings = searchStrings.filter(str => str.status === 'processing');
    if (processingStrings.length === 0) return;
    
    setIsLongPolling(true);
    
    const intervalId = setInterval(() => {
      refetch().catch(error => {
        console.error('Error during long polling:', error);
        if (onError) onError('Error refreshing search string data');
      });
      
      // Check if we still have processing strings
      const stillProcessing = processingStrings.some(str => 
        searchStrings?.find(s => s.id === str.id && s.status === 'processing')
      );
      
      if (!stillProcessing) {
        setIsLongPolling(false);
        clearInterval(intervalId);
      }
    }, 5000); // Poll every 5 seconds
    
    return () => {
      clearInterval(intervalId);
      setIsLongPolling(false);
    };
  }, [searchStrings, refetch, onError]);

  const handleCopy = (searchString: string) => {
    navigator.clipboard.writeText(searchString);
    toast({
      title: 'Copied to clipboard',
      description: 'Search string has been copied to your clipboard',
    });
  };

  const handleOpenDetail = (searchString: SearchString) => {
    setSelectedString(searchString);
    setIsDialogOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDialogOpen(false);
    setSelectedString(null);
  };

  const handleUpdateSearchString = async (id: string, generatedString: string) => {
    try {
      const success = await updateSearchString(id, generatedString);
      if (success) {
        // Update local state
        if (selectedString && selectedString.id === id) {
          setSelectedString({
            ...selectedString,
            generated_string: generatedString,
            updated_at: new Date().toISOString()
          });
        }
        if (onError) onError(null);
      }
      return success;
    } catch (error) {
      console.error('Error updating search string:', error);
      if (onError) onError('Failed to update search string. Please try again.');
      return false;
    }
  };

  const handleDeleteSearchString = async (id: string) => {
    try {
      await deleteSearchString(id);
      if (onError) onError(null);
    } catch (error) {
      console.error('Error deleting search string:', error);
      if (onError) onError('Failed to delete search string. Please try again.');
    }
  };

  const getSourceIcon = (source: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const truncate = (str: string, length: number) => {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
  };

  const getFilename = (path: string) => {
    if (!path) return '';
    return path.split('/').pop() || path;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Search Strings</CardTitle>
          <CardDescription>View and manage your saved search strings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-md animate-pulse">
                <div className="w-1/3 h-4 bg-gray-200 rounded mb-4"></div>
                <div className="w-full h-8 bg-gray-200 rounded mb-2"></div>
                <div className="flex gap-2 mt-4">
                  <div className="w-20 h-6 bg-gray-200 rounded"></div>
                  <div className="w-20 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Search Strings</CardTitle>
        <CardDescription>View and manage your saved search strings</CardDescription>
      </CardHeader>
      <CardContent>
        {isLongPolling && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
            <span>Refreshing search strings in progress...</span>
          </div>
        )}
        
        {searchStrings && searchStrings.length > 0 ? (
          <div className="space-y-4">
            {searchStrings.map((searchString) => (
              <div key={searchString.id} className="p-4 border rounded-md hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant={searchString.type === 'recruiting' ? 'default' : 'secondary'}>
                      {searchString.type === 'recruiting' ? 'Recruiting' : 'Lead Generation'}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getSourceIcon(searchString.input_source)}
                      <span>
                        {searchString.input_source === 'text' ? 'Text' : 
                         searchString.input_source === 'website' ? 'Website' : 'PDF'}
                      </span>
                    </Badge>
                    <Badge className={getStatusColor(searchString.status)}>
                      {searchString.status.charAt(0).toUpperCase() + searchString.status.slice(1)}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(searchString.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                <div className="mb-2">
                  {searchString.input_source === 'text' && (
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Input: </span>
                      {truncate(searchString.input_text || '', 100)}
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
                        {truncate(searchString.input_url || '', 60)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  
                  {searchString.input_source === 'pdf' && (
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">PDF: </span>
                      {getFilename(searchString.input_pdf_path || '')}
                    </div>
                  )}
                </div>
                
                <div className="p-3 bg-gray-50 border rounded-md font-mono text-xs mb-3 overflow-x-auto">
                  {searchString.generated_string || 'Processing...'}
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenDetail(searchString)}
                    className="text-xs"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopy(searchString.generated_string || '')}
                    className="text-xs"
                    disabled={!searchString.generated_string}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  
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
                          onClick={() => handleDeleteSearchString(searchString.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">No search strings found</h3>
            <p className="text-gray-500 mb-4">
              You haven't created any search strings yet. Use the form above to create your first search string.
            </p>
          </div>
        )}
        
        {selectedString && (
          <SearchStringDetailDialog 
            searchString={selectedString}
            open={isDialogOpen}
            onClose={handleCloseDetail}
            onUpdate={handleUpdateSearchString}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default SearchStringsList;
