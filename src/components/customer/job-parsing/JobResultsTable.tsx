
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExternalLink, Info, ChevronDown, ChevronUp, UserCircle } from 'lucide-react';
import { Job, HRContact } from '@/types/job-parsing';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
  const [jobContacts, setJobContacts] = useState<Record<string, HRContact[]>>({});
  const [loadingContacts, setLoadingContacts] = useState<Record<string, boolean>>({});
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
  const toggleRow = async (jobId: string, company: string) => {
    // If row is already open, just close it
    if (openRows.includes(jobId)) {
      setOpenRows(prev => prev.filter(id => id !== jobId));
      return;
    }
    
    // Add the row to open rows
    setOpenRows(prev => [...prev, jobId]);
    
    // If we already fetched contacts for this job, don't fetch again
    if (jobContacts[jobId]) {
      return;
    }
    
    // Fetch HR contacts for this company
    try {
      setLoadingContacts(prev => ({ ...prev, [jobId]: true }));
      
      console.log(`Fetching HR contacts for job ${jobId} at company ${company}`);
      
      const { data, error } = await supabase
        .from('hr_contacts')
        .select('*')
        .eq('job_offer_id', jobId);
      
      if (error) {
        console.error('Error fetching HR contacts:', error);
        toast({
          title: 'Fehler',
          description: 'HR-Kontakte konnten nicht geladen werden',
          variant: 'destructive'
        });
        return;
      }
      
      console.log(`Fetched ${data.length} HR contacts for job ${jobId}:`, data);
      
      // Update the contacts state
      setJobContacts(prev => ({
        ...prev,
        [jobId]: data as HRContact[]
      }));
    } catch (err) {
      console.error('Error loading HR contacts:', err);
    } finally {
      setLoadingContacts(prev => ({ ...prev, [jobId]: false }));
    }
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
                const contacts = jobContacts[rowId] || [];
                const isLoading = loadingContacts[rowId] || false;
                
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
                            onClick={() => toggleRow(rowId, job.company)}
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
                                {isLoading ? 'Lade Kontakte...' : `${contacts.length} HR-Kontakte gefunden`}
                              </Badge>
                            </div>
                            {isLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {contacts.length > 0 ? (
                                  contacts.map((contact, i) => (
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
                                  ))
                                ) : (
                                  <div className="col-span-full text-center py-4 text-muted-foreground">
                                    Keine HR-Kontakte gefunden für dieses Unternehmen
                                  </div>
                                )}
                              </div>
                            )}
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
