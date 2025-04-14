
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Copy, Check, Folder } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import StatusBadge from './StatusBadge';
import { SearchString } from '@/hooks/search-strings/search-string-types';
import { useToast } from '@/hooks/use-toast';

interface SearchStringRowProps {
  item: SearchString;
  companyName: string;
  userEmail: string;
  onViewDetails: (searchString: SearchString) => void;
  onMarkAsProcessed: (id: string, e: React.MouseEvent) => Promise<void>;
  onCreateProject: (searchString: SearchString, e: React.MouseEvent) => void;
}

const SearchStringRow: React.FC<SearchStringRowProps> = ({
  item,
  companyName,
  userEmail,
  onViewDetails,
  onMarkAsProcessed,
  onCreateProject
}) => {
  const { toast } = useToast();

  const getTypeLabel = (type: string) => {
    return type === 'recruiting' ? 'Recruiting' : 'Lead Generation';
  };

  const handleCopySearchString = (e: React.MouseEvent, searchString: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(searchString);
    toast({
      title: 'Copied to clipboard',
      description: 'Search string has been copied to your clipboard',
    });
  };

  return (
    <TableRow 
      key={item.id} 
      className="cursor-pointer hover:bg-muted/50" 
      onClick={() => onViewDetails(item)}
    >
      <TableCell>{userEmail || item.user_id.substring(0, 8)}</TableCell>
      <TableCell>{companyName || 'N/A'}</TableCell>
      <TableCell>{getTypeLabel(item.type)}</TableCell>
      <TableCell><StatusBadge status={item.status} isProcessed={item.is_processed} /></TableCell>
      <TableCell>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={(e) => {
            e.stopPropagation();
            onViewDetails(item);
          }}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View details</span>
          </Button>
          
          {item.generated_string && (
            <Button variant="ghost" size="icon" onClick={(e) => handleCopySearchString(e, item.generated_string || '')}>
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy search string</span>
            </Button>
          )}
          
          {item.status === 'completed' && !item.is_processed && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => onMarkAsProcessed(item.id, e)}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <Check className="h-4 w-4" />
              <span className="sr-only">Mark as processed</span>
            </Button>
          )}
          
          {item.status === 'completed' && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => onCreateProject(item, e)}
              className="text-green-600 hover:text-green-800 hover:bg-green-50"
            >
              <Folder className="h-4 w-4" />
              <span className="sr-only">Create project</span>
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default SearchStringRow;
