
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { SearchString } from '@/hooks/search-strings/search-string-types';
import SearchStringRow from './SearchStringRow';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface SearchStringsTableProps {
  searchStrings: SearchString[];
  companyNames: Record<string, string>;
  userEmails: Record<string, string>;
  onViewDetails: (searchString: SearchString) => void;
  onMarkAsProcessed: (id: string, e: React.MouseEvent) => Promise<void>;
  onCreateProject: (searchString: SearchString, e: React.MouseEvent) => void;
}

const SearchStringsTable: React.FC<SearchStringsTableProps> = ({
  searchStrings,
  companyNames,
  userEmails,
  onViewDetails,
  onMarkAsProcessed,
  onCreateProject
}) => {
  const missingUserInfo = searchStrings.filter(s => !userEmails[s.user_id]);
  
  return (
    <div className="w-full border rounded-md">
      {missingUserInfo.length > 0 && (
        <Alert variant="destructive" className="m-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to find email info for {missingUserInfo.length} users. 
            Some user emails may not display correctly.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">User</TableHead>
              <TableHead className="whitespace-nowrap">Company</TableHead>
              <TableHead className="whitespace-nowrap">Type</TableHead>
              <TableHead className="whitespace-nowrap">Source</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Created</TableHead>
              <TableHead className="whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {searchStrings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  No search strings found
                </TableCell>
              </TableRow>
            ) : (
              searchStrings.map((item) => (
                <SearchStringRow
                  key={item.id}
                  item={item}
                  companyName={item.company_id ? (companyNames[item.company_id] || 'N/A') : 'N/A'}
                  userEmail={userEmails[item.user_id] || item.user_id.substring(0, 8)}
                  onViewDetails={onViewDetails}
                  onMarkAsProcessed={onMarkAsProcessed}
                  onCreateProject={onCreateProject}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SearchStringsTable;
