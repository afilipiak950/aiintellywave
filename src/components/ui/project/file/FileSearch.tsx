
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from "../../input";

interface FileSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const FileSearch: React.FC<FileSearchProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <Input
        type="search"
        placeholder="Search files..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default FileSearch;
