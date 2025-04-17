
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExternalLink, Info, ChevronDown, ChevronUp, UserCircle } from 'lucide-react';
import { Job } from '@/types/job-parsing';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

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
  const [page, setPage] = useState(0);
  const [openRows, setOpenRows] = useState<string[]>([]);
  const itemsPerPage = 10;
  
  // Calculate pagination
  const totalPages = Math.ceil(jobs.length / itemsPerPage);
  const startIndex = page * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, jobs.length);
  const currentJobs = jobs.slice(startIndex, endIndex);
  
  // Navigate between pages
  const goToPage = (newPage: number) => {
    setPage(Math.max(0, Math.min(newPage, totalPages - 1)));
  };
  
  // Toggle row expansion
  const toggleRow = (jobId: string) => {
    setOpenRows(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };
  
  // Open job URL in new tab
  const openJobUrl = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  // Format search description
  const getSearchDescription = () => {
    let desc = `${jobs.length} Ergebnisse für "${searchQuery}"`;
    if (searchLocation) {
      desc += ` in "${searchLocation}"`;
    }
    return desc;
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Suchergebnisse</CardTitle>
        <CardDescription>{getSearchDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jobtitel</TableHead>
                <TableHead>Unternehmen</TableHead>
                <TableHead>Standort</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentJobs.map((job, index) => {
                const rowId = `${job.company}-${job.title}-${index}`;
                const isOpen = openRows.includes(rowId);
                
                return (
                  <React.Fragment key={rowId}>
                    <TableRow className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.company}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleRow(rowId)}
                          >
                            <UserCircle className="h-4 w-4 mr-1" />
                            HR-Kontakte
                            {isOpen ? (
                              <ChevronUp className="h-4 w-4 ml-1" />
                            ) : (
                              <ChevronDown className="h-4 w-4 ml-1" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onJobSelect(job);
                            }}
                          >
                            <Info className="h-4 w-4" />
                            <span className="sr-only">Details</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => openJobUrl(job.url, e)}
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">Öffnen</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isOpen && (
                      <TableRow>
                        <TableCell colSpan={4} className="p-0">
                          <div className="p-4 bg-muted/30 space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">
                                {job.hrContacts?.length || 0} HR-Kontakte gefunden
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {job.hrContacts?.map((contact, i) => (
                                <div key={i} className="p-3 bg-background rounded-lg border">
                                  <div className="font-medium">{contact.full_name}</div>
                                  <div className="text-sm text-muted-foreground">{contact.role}</div>
                                  {contact.email && (
                                    <div className="text-sm mt-1">
                                      <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                                        {contact.email}
                                      </a>
                                    </div>
                                  )}
                                  {contact.source && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Quelle: {contact.source}
                                    </div>
                                  )}
                                </div>
                              ))}
                              {(!job.hrContacts || job.hrContacts.length === 0) && (
                                <div className="col-span-full text-center py-4 text-muted-foreground">
                                  Keine HR-Kontakte gefunden für dieses Unternehmen
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page === 0}
            >
              Vorherige
            </Button>
            <span className="text-sm text-muted-foreground">
              Seite {page + 1} von {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages - 1}
            >
              Nächste
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobResultsTable;
