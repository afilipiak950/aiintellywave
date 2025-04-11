
import React from 'react';
import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
  totalPages: number;
  currentPage: number;
  handlePageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  totalPages,
  currentPage,
  handlePageChange
}) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="space-x-2 flex">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <div className="flex items-center">
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
};

export default PaginationControls;
