
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExternalLink, Info, ChevronDown, ChevronUp, UserCircle, Linkedin, Loader2, AlertCircle } from 'lucide-react';
import { Job, HRContact } from '@/types/job-parsing';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
  const [allContactsCount, setAllContactsCount] = useState<number | null>(null);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(jobs.length / itemsPerPage);
  const startIndex = page * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, jobs.length);
  const currentJobs = jobs.slice(startIndex, endIndex);
  
  useEffect(() => {
    setPage(0);
  }, [jobs]);

  useEffect(() => {
    const checkContactsAvailability = async () => {
      try {
        const { count, error } = await supabase
          .from('hr_contacts')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error('Error checking HR contacts:', error);
          return;
        }
        
        setAllContactsCount(count || 0);
        console.log(`Found ${count} total HR contacts in the database`);
      } catch (err) {
        console.error('Error checking contacts availability:', err);
      }
    };
    
    checkContactsAvailability();
  }, []);
  
  const goToPage = (newPage: number) => {
    setPage(Math.max(0, Math.min(newPage, totalPages - 1)));
  };

  const normalizeCompanyName = (name: string): string => {
    if (!name) return '';
    
    // Convert to lowercase and remove excess whitespace
    let normalized = name.toLowerCase().trim();
    
    // Remove common legal entity indicators
    normalized = normalized.replace(/gmbh|ag|inc|llc|kg|co\.|co|&|\be\.v\.\b|\bev\b/g, '');
    
    // Remove common words like "Allgemeiner", "Deutscher", etc. that might differ in data sources
    normalized = normalized.replace(/\ballgemeiner\b|\bdeutscher\b|\bclub\b/g, '');
    
    // Remove special characters and punctuation
    normalized = normalized.replace(/[^\w\s]/gi, '');
    
    // Remove extra spaces and trim
    return normalized.replace(/\s+/g, ' ').trim();
  };

  const findMatchingContacts = useCallback((contacts: HRContact[], companyName: string): HRContact[] => {
    if (!contacts || contacts.length === 0 || !companyName) {
      console.log('No contacts or company name provided');
      return [];
    }
    
    const normalizedCompanyName = normalizeCompanyName(companyName);
    console.log(`Normalized company name for matching: "${normalizedCompanyName}" (from "${companyName}")`);
    
    // First try exact company matches
    let matchingContacts = contacts.filter(contact => {
      // Match company in source or department
      const contactDept = normalizeCompanyName(contact.department || '');
      const contactSource = normalizeCompanyName(contact.source || '');
      
      return contactDept.includes(normalizedCompanyName) || 
             contactSource.includes(normalizedCompanyName);
    });
    
    console.log(`Found ${matchingContacts.length} direct company name matches for "${companyName}"`);
    
    if (matchingContacts.length > 0) {
      return matchingContacts.slice(0, 15);
    }
    
    // If no exact matches, try fuzzy matching - check if any part of the company name is in the contacts
    if (normalizedCompanyName.length > 3) {
      const words = normalizedCompanyName.split(' ');
      for (const word of words) {
        if (word.length < 3) continue; // Skip short words
        
        const wordMatches = contacts.filter(contact => {
          const contactDept = normalizeCompanyName(contact.department || '');
          const contactSource = normalizeCompanyName(contact.source || '');
          
          return contactDept.includes(word) || contactSource.includes(word);
        });
        
        console.log(`Found ${wordMatches.length} partial matches for word "${word}"`);
        
        if (wordMatches.length > 0) {
          return wordMatches.slice(0, 15);
        }
      }
    }
    
    // If no matches, check for specifically tagged HR contacts
    const hrContacts = contacts.filter(contact => {
      const contactDept = (contact.department || '').toLowerCase();
      const contactRole = (contact.role || '').toLowerCase();
      
      return contactDept.includes('hr') || 
             contactDept.includes('human resources') || 
             contactRole.includes('hr') || 
             contactRole.includes('human resources');
    });
    
    console.log(`Found ${hrContacts.length} specifically tagged HR contacts`);
    
    if (hrContacts.length > 0) {
      return hrContacts.slice(0, 15);
    }
    
    // As a last resort, return the most recent contacts
    return contacts.sort((a, b) => {
      const dateA = new Date(a.created_at || '').getTime();
      const dateB = new Date(b.created_at || '').getTime();
      return dateB - dateA;
    }).slice(0, 15);
  }, []);

  const toggleRow = async (rowId: string, company: string) => {
    if (openRows.includes(rowId)) {
      setOpenRows(prev => prev.filter(id => id !== rowId));
      return;
    }
    
    setOpenRows(prev => [...prev, rowId]);
    
    if (jobContacts[rowId] && jobContacts[rowId].length > 0) {
      return;
    }
    
    setLoadingContacts(prev => ({ ...prev, [rowId]: true }));
    setContactLoadErrors(prev => ({ ...prev, [rowId]: '' }));
    
    try {
      console.log(`Fetching HR contacts for job ${rowId} at company ${company}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const { count: contactCount, error: countError } = await supabase
        .from('hr_contacts')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        throw new Error(`Error counting HR contacts: ${countError.message}`);
      }
      
      console.log(`Database has a total of ${contactCount || 0} HR contacts`);
      
      const { data: allHrContacts, error: contactsError } = await supabase
        .from('hr_contacts')
        .select('*')
        .order('created_at', { ascending: false });
      
      clearTimeout(timeoutId);
      
      if (contactsError) {
        console.error('Error fetching HR contacts:', contactsError);
        throw new Error(`Fehler beim Abrufen der HR-Kontakte: ${contactsError.message}`);
      }
      
      console.log(`Retrieved ${allHrContacts?.length || 0} total HR contacts from database`);
      
      if (!allHrContacts || allHrContacts.length === 0) {
        console.log('No HR contacts found in database, triggering sync');
        setJobContacts(prev => ({ ...prev, [rowId]: [] }));
        setLoadingContacts(prev => ({ ...prev, [rowId]: false }));
        
        try {
          const { data: syncData, error: syncError } = await supabase.functions.invoke('scrape-and-enrich', {
            body: { 
              company: company,
              url: window.location.origin,
              maxPages: 1,
              maxDepth: 1
            }
          });
          
          if (syncError) {
            console.error('Error syncing HR contacts:', syncError);
          } else {
            console.log('Sync completed successfully:', syncData);
            
            const { data: refreshedContacts } = await supabase
              .from('hr_contacts')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(100);
              
            if (refreshedContacts && refreshedContacts.length > 0) {
              const matchingContacts = findMatchingContacts(refreshedContacts, company);
              console.log(`Found ${matchingContacts.length} matching contacts after sync`);
              setJobContacts(prev => ({ ...prev, [rowId]: matchingContacts }));
              
              setAllContactsCount(refreshedContacts.length);
              return;
            }
            
            toast({
              title: 'HR-Kontakte werden synchronisiert',
              description: 'Bitte versuchen Sie es in ein paar Sekunden erneut, um die neuen Kontakte zu sehen.',
              variant: 'default'
            });
            return;
          }
        } catch (syncErr) {
          console.error('Exception during HR contacts sync:', syncErr);
        }
        
        toast({
          title: 'Keine HR-Kontakte gefunden',
          description: 'Sie können neue Kontakte erhalten, indem Sie auf "Jobs & HR-Daten synchronisieren" klicken.',
          variant: 'destructive'
        });
        return;
      }
      
      const matchingContacts = findMatchingContacts(allHrContacts, company);
      console.log(`Found ${matchingContacts.length} matching contacts for company "${company}"`);
      
      setJobContacts(prev => ({ ...prev, [rowId]: matchingContacts }));
    } catch (err) {
      console.error('Error loading HR contacts:', err);
      setContactLoadErrors(prev => ({ 
        ...prev, 
        [rowId]: err instanceof Error ? err.message : 'Unbekannter Fehler beim Laden der Kontakte'
      }));
      
      setJobContacts(prev => ({ ...prev, [rowId]: [] }));
    } finally {
      setLoadingContacts(prev => ({ ...prev, [rowId]: false }));
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
        {allContactsCount !== null && (
          <Alert className="mb-4" variant={allContactsCount > 0 ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertTitle>HR-Kontakte-Status</AlertTitle>
            <AlertDescription>
              {allContactsCount > 0 
                ? `Insgesamt ${allContactsCount} HR-Kontakte in der Datenbank verfügbar.` 
                : "Keine HR-Kontakte in der Datenbank gefunden. Bitte synchronisieren Sie die Daten."}
            </AlertDescription>
          </Alert>
        )}
        
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
                const error = contactLoadErrors[rowId] || '';
                
                return (
                  <React.Fragment key={`job-row-${index}`}>
                    <TableRow 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleRow(rowId, job.company)}
                      data-company-name={job.company}
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
                      <TableRow key={`contacts-${index}`}>
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
                                    <div key={`contact-${rowId}-${i}`} className="p-3 bg-background rounded-lg border">
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
