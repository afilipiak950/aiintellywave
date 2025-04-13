
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchString, useSearchStrings } from '@/hooks/search-strings/use-search-strings';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { LuCopy, LuEye, LuTrash2, LuRefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SearchStringDetailDialog from './SearchStringDetailDialog';

interface SearchStringsListProps {
  companyId: string;
}

const SearchStringsList: React.FC<SearchStringsListProps> = ({ companyId }) => {
  const { toast } = useToast();
  const { searchStrings, isLoading, deleteSearchString, refetch } = useSearchStrings({ companyId });
  const [selectedSearchString, setSelectedSearchString] = React.useState<SearchString | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  const handleCopySearchString = (searchString: string) => {
    navigator.clipboard.writeText(searchString);
    toast({
      title: 'Copied to clipboard',
      description: 'Search string has been copied to your clipboard',
    });
  };

  const handleViewDetails = (searchString: SearchString) => {
    setSelectedSearchString(searchString);
    setIsDetailOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this search string?')) {
      await deleteSearchString(id);
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
    return type === 'recruiting' ? 'Recruiting' : 'Lead Generation';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Search Strings</CardTitle>
          <CardDescription>View and manage your generated search strings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="w-full h-10" />
            <Skeleton className="w-full h-24" />
            <Skeleton className="w-full h-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Search Strings</CardTitle>
          <CardDescription>View and manage your generated search strings</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="flex items-center gap-1"
        >
          <LuRefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </CardHeader>
      <CardContent>
        {searchStrings && searchStrings.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchStrings.map((item) => (
                <TableRow 
                  key={item.id} 
                  className="cursor-pointer hover:bg-muted/50" 
                  onClick={() => handleViewDetails(item)}
                >
                  <TableCell>{getTypeLabel(item.type)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(item);
                      }}>
                        <LuEye className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Button>
                      
                      {item.generated_string && (
                        <Button variant="ghost" size="icon" onClick={(e) => {
                          e.stopPropagation();
                          handleCopySearchString(item.generated_string || '');
                        }}>
                          <LuCopy className="h-4 w-4" />
                          <span className="sr-only">Copy search string</span>
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleDelete(item.id, e)}
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      >
                        <LuTrash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium">No search strings found</h3>
            <p className="text-muted-foreground mt-2">
              Create your first search string using the form above
            </p>
          </div>
        )}
      </CardContent>
      
      {selectedSearchString && (
        <SearchStringDetailDialog
          searchString={selectedSearchString}
          open={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </Card>
  );
};

export default SearchStringsList;
