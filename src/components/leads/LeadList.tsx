
import { Table, TableBody } from "@/components/ui/table";
import { Lead } from "@/types/lead";
import { motion } from 'framer-motion';
import { useState, useMemo, useCallback } from 'react';
import { SortDirection, SortField } from "../../types/leadTable";
import LeadListHeader from "./list/LeadListHeader";
import LeadListRow from "./list/LeadListRow";
import LeadListEmpty from "./list/LeadListEmpty";
import LeadListLoading from "./list/LeadListLoading";
import LeadListPagination from "./list/LeadListPagination";
import PageSizeSelector from "./list/PageSizeSelector";
import LeadViewToggle from "./LeadViewToggle";

interface LeadListProps {
  leads: Lead[];
  onUpdateLead: (id: string, updates: Partial<Lead>) => Promise<Lead | null>;
  loading?: boolean;
  viewMode: 'list' | 'card';
  setViewMode: (mode: 'list' | 'card') => void;
}

const LeadList = ({ 
  leads, 
  onUpdateLead, 
  loading = false, 
  viewMode, 
  setViewMode 
}: LeadListProps) => {
  // Sorting state
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  // Handle sort
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      // Toggle direction if already sorting by this field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
    // Reset to first page when sorting changes
    setPage(1);
  }, [sortField, sortDirection]);

  // Apply sorting and pagination to leads data
  const sortedAndPaginatedLeads = useMemo(() => {
    // First, sort the leads
    let sorted = [...leads];
    
    if (sortField) {
      sorted.sort((a, b) => {
        let valA, valB;
        
        // Handle different field types for sorting
        switch(sortField) {
          case 'name':
          case 'company':
          case 'position':
            valA = String(a[sortField] || '').toLowerCase();
            valB = String(b[sortField] || '').toLowerCase();
            break;
          case 'status':
            valA = a.status;
            valB = b.status;
            break;
          case 'project_name':
            valA = String(a.project_name || '').toLowerCase();
            valB = String(b.project_name || '').toLowerCase();
            break;
          default:
            return 0;
        }
        
        if (sortDirection === 'asc') {
          return valA > valB ? 1 : valA < valB ? -1 : 0;
        } else {
          return valA < valB ? 1 : valA > valB ? -1 : 0;
        }
      });
    }
    
    // Then, paginate the sorted leads
    const startIndex = (page - 1) * pageSize;
    return sorted.slice(startIndex, startIndex + pageSize);
  }, [leads, sortField, sortDirection, page, pageSize]);

  // Calculate total number of pages
  const totalPages = Math.ceil(leads.length / pageSize);

  // Handle page size change
  const handlePageSizeChange = useCallback((value: number) => {
    setPageSize(value);
    setPage(1); // Reset to first page when changing page size
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  }, [totalPages]);

  // Handle row click
  const handleRowClick = useCallback((lead: Lead) => {
    const event = new CustomEvent('leadClick', { detail: lead });
    document.dispatchEvent(event);
  }, []);

  // Loading state
  if (loading) {
    return <LeadListLoading />;
  }
  
  // Empty state
  if (leads.length === 0) {
    return <LeadListEmpty />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          Showing {Math.min((page - 1) * pageSize + 1, leads.length)} to {Math.min(page * pageSize, leads.length)} of {leads.length} leads
        </div>
        <div className="flex items-center space-x-4">
          <LeadViewToggle viewMode={viewMode} setViewMode={setViewMode} />
          <PageSizeSelector 
            pageSize={pageSize} 
            onPageSizeChange={handlePageSizeChange} 
          />
        </div>
      </div>
      
      <div className="rounded-md overflow-hidden border">
        <Table>
          <LeadListHeader 
            sortField={sortField}
            sortDirection={sortDirection}
            handleSort={handleSort}
          />
          <TableBody>
            {sortedAndPaginatedLeads.map((lead) => (
              <LeadListRow
                key={lead.id}
                lead={lead}
                onRowClick={handleRowClick}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      {leads.length > 0 && (
        <LeadListPagination 
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </motion.div>
  );
};

export default LeadList;
