
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
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {searchStrings.map((item) => (
            <SearchStringRow
              key={item.id}
              item={item}
              companyName={item.company_id ? (companyNames[item.company_id] || 'Loading...') : ''}
              userEmail={userEmails[item.user_id] || ''}
              onViewDetails={onViewDetails}
              onMarkAsProcessed={onMarkAsProcessed}
              onCreateProject={onCreateProject}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SearchStringsTable;
