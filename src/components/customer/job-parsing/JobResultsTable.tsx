
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExternalLink, Building, MapPin, Info, AlertCircle, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Job } from '@/types/job-parsing';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface JobResultsTableProps {
  jobs: Job[];
  searchQuery: string;
  searchLocation?: string;
  onJobSelect: (job: Job) => void;
}

const JobResultsTable: React.FC<JobResultsTableProps> = ({
  jobs,
  searchQuery,
  searchLocation,
  onJobSelect
}) => {
  // Add debug log to check if the component receives jobs
  console.log('JobResultsTable rendering with jobs:', jobs);
  
  // Set up pagination
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  if (!jobs || jobs.length === 0) {
    return null;
  }

  // Calculate which jobs to display on the current page
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  // Check if we're showing fallback results
  const usingFallback = jobs.some(job => job.source === 'Fallback (Apify API nicht verfügbar)');

  // Handle page navigation
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Generate page numbers for pagination
  const renderPageNumbers = () => {
    const pageItems = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
      pageItems.push(
        <PaginationItem key="first">
          <PaginationLink 
            onClick={() => goToPage(1)}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      if (startPage > 2) {
        pageItems.push(
          <PaginationItem key="ellipsis-start">
            <span className="px-4">...</span>
          </PaginationItem>
        );
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageItems.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={currentPage === i}
            onClick={() => goToPage(i)}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageItems.push(
          <PaginationItem key="ellipsis-end">
            <span className="px-4">...</span>
          </PaginationItem>
        );
      }
      
      pageItems.push(
        <PaginationItem key="last">
          <PaginationLink 
            onClick={() => goToPage(totalPages)}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return pageItems;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gefundene Jobangebote ({jobs.length})</CardTitle>
          {usingFallback && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
              <AlertCircle size={12} className="mr-1" /> Alternative Ergebnisse
            </Badge>
          )}
        </div>
        <CardDescription>
          Ergebnisse für "{searchQuery}"
          {searchLocation && ` in ${searchLocation}`}
          {usingFallback && ` (Google Jobs API eingeschränkt verfügbar)`}
        </CardDescription>
      </CardHeader>
      {usingFallback && (
        <div className="mx-6 mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
          <div className="flex items-center">
            <AlertCircle size={14} className="mr-2" />
            <p>Die Google Jobs API ist derzeit nicht verfügbar. Es werden alternative Jobergebnisse angezeigt.</p>
          </div>
        </div>
      )}
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Position</TableHead>
                <TableHead>Unternehmen</TableHead>
                <TableHead>Standort</TableHead>
                <TableHead className="hidden md:table-cell">Details</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentJobs.map((job, idx) => (
                <TableRow key={idx} className="cursor-pointer hover:bg-muted/50" onClick={() => onJobSelect(job)}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                      {job.company}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      {job.location}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      Details
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <a 
                        href={job.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center p-1 rounded-md hover:bg-muted"
                        aria-label="Auf Original-Seite ansehen"
                      >
                        <ExternalLink className="h-4 w-4 text-blue-600" />
                      </a>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">
                Seite {currentPage} von {totalPages}
              </div>
            </div>
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={goToPreviousPage}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    aria-disabled={currentPage === 1}
                  />
                </PaginationItem>
                
                {renderPageNumbers()}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={goToNextPage}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    aria-disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Info className="h-3 w-3 mr-1" />
                {usingFallback 
                  ? "Alternative Ergebnisse aufgrund von API-Einschränkungen" 
                  : "Daten von Google Jobs über Apify"}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{usingFallback 
                ? "Der Google Jobs API-Dienst ist momentan nicht verfügbar. Wir zeigen alternative Jobangebote an."
                : "Die Jobangebote werden von Google Jobs abgerufen und zeigen bis zu 100 Jobs pro Suche."}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};

export default JobResultsTable;
