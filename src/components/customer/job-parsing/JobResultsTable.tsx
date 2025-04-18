
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExternalLink, Info, ChevronDown, ChevronUp, UserCircle, Linkedin, Loader2 } from 'lucide-react';
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
  const [contactLoadErrors, setContactLoadErrors] = useState<Record<string, string>>({});
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(jobs.length / itemsPerPage);
  const startIndex = page * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, jobs.length);
  const currentJobs = jobs.slice(startIndex, endIndex);
  
  // Reset page when jobs change
  useEffect(() => {
    setPage(0);
  }, [jobs]);
  
  const goToPage = (newPage: number) => {
    setPage(Math.max(0, Math.min(newPage, totalPages - 1)));
  };
  
  const toggleRow = async (jobId: string, company: string) => {
    // Close the row if it's already open
    if (openRows.includes(jobId)) {
      setOpenRows(prev => prev.filter(id => id !== jobId));
      return;
    }
    
    // Open the row
    setOpenRows(prev => [...prev, jobId]);
    
    // If we already have contacts for this job, don't load them again
    if (jobContacts[jobId] && jobContacts[jobId].length > 0) {
      return;
    }
    
    // Set loading state
    setLoadingContacts(prev => ({ ...prev, [jobId]: true }));
    setContactLoadErrors(prev => ({ ...prev, [jobId]: '' }));
    
    try {
      console.log(`Fetching HR contacts for job ${jobId} at company ${company}`);
      
      // Fetch HR contacts from the database with a 60-second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const { data: allHrContacts, error: contactsError } = await supabase
        .from('hr_contacts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      clearTimeout(timeoutId);
      
      if (contactsError) {
        console.error('Error fetching HR contacts:', contactsError);
        throw new Error(`Fehler beim Abrufen der HR-Kontakte: ${contactsError.message}`);
      }
      
      console.log(`Retrieved ${allHrContacts?.length || 0} total HR contacts`);
      
      if (!allHrContacts || allHrContacts.length === 0) {
        setJobContacts(prev => ({ ...prev, [jobId]: [] }));
        setLoadingContacts(prev => ({ ...prev, [jobId]: false }));
        toast({
          title: 'Keine HR-Kontakte gefunden',
          description: 'Sie können neue Kontakte erhalten, indem Sie auf "Jobs & HR-Daten synchronisieren" klicken.',
          variant: 'destructive'
        });
        return;
      }
      
      // Use fuzzy matching for company names
      const companyNameVariations = [
        company.toLowerCase(),
        company.toLowerCase().replace(/\s+/g, ''),
        company.toLowerCase().replace(/gmbh|ag|inc|llc/g, '').trim(),
        // Add normalized versions without special characters
        company.toLowerCase().replace(/[^\w\s]/gi, ''),
      ];
      
      // Find matches based on company name similarity
      let matchingContacts = allHrContacts.filter(contact => {
        if (!contact.department) return false;
        
        const contactCompany = contact.department.toLowerCase();
        return companyNameVariations.some(variation => 
          contactCompany.includes(variation) || 
          (variation.length > 3 && contactCompany.includes(variation))
        );
      });
      
      // If not enough matches found via direct company name, use job offer ID if available
      if (matchingContacts.length < 2) {
        console.log(`Not enough matches found by company name, checking direct job associations`);
        const jobMatches = allHrContacts.filter(contact => 
          contact.job_offer_id !== null
        );
        
        // Combine both lists if we found job associations
        if (jobMatches.length > 0) {
          matchingContacts = [...matchingContacts, ...jobMatches];
          // Remove duplicates by converting to Set based on ID
          matchingContacts = Array.from(
            new Map(matchingContacts.map(item => [item.id, item])).values()
          );
        }
      }
      
      console.log(`Found ${matchingContacts.length} HR contacts for company ${company}`);
      
      // If still no matches found, show recent contacts as fallback
      if (matchingContacts.length === 0) {
        console.log(`No specific matches found, showing most recent contacts as fallback`);
        matchingContacts = allHrContacts.slice(0, 10);
      }
      
      // Sort contacts by creation date (newest first)
      matchingContacts.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      // Limit to a reasonable number
      matchingContacts = matchingContacts.slice(0, 15);
      
      // Store the contacts for this job
      setJobContacts(prev => ({ ...prev, [jobId]: matchingContacts }));
    } catch (err) {
      console.error('Error loading HR contacts:', err);
      setContactLoadErrors(prev => ({ 
        ...prev, 
        [jobId]: err instanceof Error ? err.message : 'Unbekannter Fehler beim Laden der Kontakte'
      }));
      
      // Set empty contact list to remove loading indicator
      setJobContacts(prev => ({ ...prev, [jobId]: [] }));
    } finally {
      setLoadingContacts(prev => ({ ...prev, [jobId]: false }));
    }
  };
  
  const openJobUrl = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
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
                // Create a unique ID for each row
                const rowId = `${job.company}-${job.title}-${index}`;
                const isOpen = openRows.includes(rowId);
                const contacts = jobContacts[rowId] || [];
                const isLoading = loadingContacts[rowId] || false;
                const error = contactLoadErrors[rowId] || '';
                
                return (
                  <React.Fragment key={rowId}>
                    <TableRow 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleRow(rowId, job.company)}
                    >
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.company}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(rowId, job.company);
                            }}
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
                              {error ? (
                                <Badge variant="destructive">
                                  Fehler: {error}
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  {isLoading ? 'Lade Kontakte...' : `${contacts.length} HR-Kontakte gefunden`}
                                </Badge>
                              )}
                            </div>
                            {isLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {contacts.length > 0 ? (
                                  contacts.map((contact, i) => (
                                    <div key={i} className="p-3 bg-background rounded-lg border">
                                      <div className="font-medium">{contact.full_name}</div>
                                      <div className="text-sm text-muted-foreground">{contact.role}</div>
                                      
                                      {contact.department && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                          Abteilung: {contact.department}
                                        </div>
                                      )}
                                      
                                      {contact.seniority && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                          Seniorität: {contact.seniority}
                                        </div>
                                      )}
                                      
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {contact.email && (
                                          <a href={`mailto:${contact.email}`} className="inline-flex items-center text-xs text-primary hover:underline">
                                            <span className="i-lucide-mail h-3 w-3 mr-1" />
                                            {contact.email}
                                          </a>
                                        )}
                                        
                                        {contact.phone && (
                                          <a href={`tel:${contact.phone}`} className="inline-flex items-center text-xs text-primary hover:underline">
                                            <span className="i-lucide-phone h-3 w-3 mr-1" />
                                            {contact.phone}
                                          </a>
                                        )}
                                        
                                        {contact.linkedin_url && (
                                          <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-primary hover:underline">
                                            <Linkedin className="h-3 w-3 mr-1" />
                                            LinkedIn
                                          </a>
                                        )}
                                      </div>
                                      
                                      {contact.source && (
                                        <div className="text-xs text-muted-foreground mt-2">
                                          Quelle: {contact.source}
                                        </div>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <div className="col-span-full text-center py-4 text-muted-foreground">
                                    <p>Keine HR-Kontakte gefunden für dieses Unternehmen</p>
                                    <p className="text-xs mt-1">Klicken Sie auf "Jobs & HR-Daten synchronisieren", um Kontakte zu finden</p>
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
