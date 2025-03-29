
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lead } from "@/types/lead";
import { formatDistanceToNow } from "date-fns";
import { Building, ChevronDown, ChevronUp, Linkedin, Loader2 } from "lucide-react";
import LeadStatusBadge from "./LeadStatusBadge";
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { getLinkedInUrlFromLead } from "./detail/LeadDetailUtils";
import { useState, useMemo } from 'react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LeadListProps {
  leads: Lead[];
  onUpdateLead: (id: string, updates: Partial<Lead>) => Promise<Lead | null>;
  loading?: boolean;
}

type SortField = 'name' | 'company' | 'position' | 'status' | 'created_at' | 'project_name' | null;
type SortDirection = 'asc' | 'desc';

const LeadList = ({ leads, onUpdateLead, loading = false }: LeadListProps) => {
  // Sorting state
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const getRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Handle sort
  const handleSort = (field: SortField) => {
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
  };

  // Function to get LinkedIn URL from lead data
  const getLinkedInUrl = (lead: Lead) => {
    const linkedInUrl = getLinkedInUrlFromLead(lead);
    return linkedInUrl ? linkedInUrl : null;
  };

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
          case 'created_at':
            valA = new Date(a.created_at).getTime();
            valB = new Date(b.created_at).getTime();
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
  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setPage(1); // Reset to first page when changing page size
  };

  // Handle page change
  const goToPage = (newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
      pageNumbers.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => goToPage(1)}>1</PaginationLink>
        </PaginationItem>
      );
      
      if (startPage > 2) {
        pageNumbers.push(
          <PaginationItem key="ellipsis-start">
            <span className="px-4">...</span>
          </PaginationItem>
        );
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={page === i}
            onClick={() => goToPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <PaginationItem key="ellipsis-end">
            <span className="px-4">...</span>
          </PaginationItem>
        );
      }
      
      pageNumbers.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => goToPage(totalPages)}>{totalPages}</PaginationLink>
        </PaginationItem>
      );
    }
    
    return pageNumbers;
  };

  // Render sort indicator for column headers
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' 
      ? <ChevronUp className="inline h-4 w-4 ml-1" />
      : <ChevronDown className="inline h-4 w-4 ml-1" />;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-muted-foreground">Loading leads...</p>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (leads.length === 0) {
    return (
      <motion.div 
        className="text-center py-16 px-4 bg-gradient-to-tr from-slate-50 to-gray-50 rounded-xl border border-slate-100 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          No leads found
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Try adjusting your search or filter criteria, or create a new lead using the "Add New Lead" button.
        </p>
      </motion.div>
    );
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
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-20">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="1000">1000</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="font-medium cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Name {renderSortIndicator('name')}
              </TableHead>
              <TableHead 
                className="font-medium cursor-pointer"
                onClick={() => handleSort('company')}
              >
                Company {renderSortIndicator('company')}
              </TableHead>
              <TableHead 
                className="font-medium cursor-pointer"
                onClick={() => handleSort('position')}
              >
                Position {renderSortIndicator('position')}
              </TableHead>
              <TableHead 
                className="font-medium cursor-pointer"
                onClick={() => handleSort('status')}
              >
                Status {renderSortIndicator('status')}
              </TableHead>
              <TableHead 
                className="font-medium cursor-pointer"
                onClick={() => handleSort('created_at')}
              >
                Created {renderSortIndicator('created_at')}
              </TableHead>
              <TableHead 
                className="font-medium cursor-pointer"
                onClick={() => handleSort('project_name')}
              >
                Project {renderSortIndicator('project_name')}
              </TableHead>
              <TableHead className="font-medium text-right">LinkedIn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndPaginatedLeads.map((lead) => {
              const linkedInUrl = getLinkedInUrlFromLead(lead);
              
              return (
                <TableRow 
                  key={lead.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={(e) => {
                    // Don't trigger row click when clicking the LinkedIn button
                    if (!(e.target as HTMLElement).closest('.linkedin-button')) {
                      const event = new CustomEvent('leadClick', { detail: lead });
                      document.dispatchEvent(event);
                    }
                  }}
                >
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.company || '—'}</TableCell>
                  <TableCell>{lead.position || '—'}</TableCell>
                  <TableCell>
                    <LeadStatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">{getRelativeTime(lead.created_at)}</div>
                  </TableCell>
                  <TableCell>
                    {lead.project_name && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Building className="h-3 w-3 mr-1" />
                        <span className="truncate max-w-[150px]">{lead.project_name}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {linkedInUrl ? (
                      <a 
                        href={linkedInUrl.startsWith('http') ? linkedInUrl : `https://${linkedInUrl}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="linkedin-button inline-block"
                      >
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="hover:bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/30"
                        >
                          <Linkedin className="h-4 w-4" />
                        </Button>
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">No profile</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      {leads.length > 0 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => goToPage(page - 1)}
                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                aria-disabled={page === 1}
              />
            </PaginationItem>
            
            {renderPageNumbers()}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => goToPage(page + 1)}
                className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                aria-disabled={page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </motion.div>
  );
};

export default LeadList;
