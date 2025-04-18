import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExternalLink, Info, ChevronDown, ChevronUp, UserCircle, Linkedin } from 'lucide-react';
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
  
  const totalPages = Math.ceil(jobs.length / itemsPerPage);
  const startIndex = page * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, jobs.length);
  const currentJobs = jobs.slice(startIndex, endIndex);
  
  const goToPage = (newPage: number) => {
    setPage(Math.max(0, Math.min(newPage, totalPages - 1)));
  };
  
  const toggleRow = async (jobId: string, company: string) => {
    if (openRows.includes(jobId)) {
      setOpenRows(prev => prev.filter(id => id !== jobId));
      return;
    }
    
    setOpenRows(prev => [...prev, jobId]);
    
    if (jobContacts[jobId]) {
      return;
    }
    
    try {
      setLoadingContacts(prev => ({ ...prev, [jobId]: true }));
      
      console.log(`Fetching HR contacts for job ${jobId} at company ${company}`);
      
      const { data: contactsData, error: contactsError } = await supabase
        .from('hr_contacts')
        .select('*')
        .ilike('full_name', `%${company}%`)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (contactsError) {
        console.error('Error fetching HR contacts:', contactsError);
        toast({
          title: 'Fehler',
          description: 'HR-Kontakte konnten nicht geladen werden',
          variant: 'destructive'
        });
        setLoadingContacts(prev => ({ ...prev, [jobId]: false }));
        return;
      }
      
      if (contactsData && contactsData.length > 0) {
        console.log(`Fetched ${contactsData.length} HR contacts based on company name match`);
        
        setJobContacts(prev => ({
          ...prev,
          [jobId]: contactsData as HRContact[] || []
        }));
        setLoadingContacts(prev => ({ ...prev, [jobId]: false }));
        return;
      }
      
      console.log(`No contacts found by company name match, trying job_offers lookup`);
      
      const { data: jobOffersData, error: jobOffersError } = await supabase
        .from('job_offers')
        .select('id')
        .ilike('company_name', company)
        .limit(5);
        
      if (jobOffersError) {
        console.error('Error fetching job offers:', jobOffersError);
        setLoadingContacts(prev => ({ ...prev, [jobId]: false }));
        return;
      }
      
      if (!jobOffersData || jobOffersData.length === 0) {
        console.log(`No job offers found for company ${company}, trying partial match`);
        
        const { data: partialJobOffersData, error: partialJobOffersError } = await supabase
          .from('job_offers')
          .select('id')
          .ilike('company_name', `%${company}%`)
          .limit(5);
          
        if (partialJobOffersError) {
          console.error('Error fetching job offers with partial match:', partialJobOffersError);
          setJobContacts(prev => ({ ...prev, [jobId]: [] }));
          setLoadingContacts(prev => ({ ...prev, [jobId]: false }));
          return;
        }
        
        if (!partialJobOffersData || partialJobOffersData.length === 0) {
          console.log(`No job offers found for company ${company} with partial match either`);
          setJobContacts(prev => ({ ...prev, [jobId]: [] }));
          setLoadingContacts(prev => ({ ...prev, [jobId]: false }));
          return;
        }
        
        const jobOfferIds = partialJobOffersData.map(jo => jo.id);
        const { data: contactsData, error: contactsError } = await supabase
          .from('hr_contacts')
          .select('*')
          .in('job_offer_id', jobOfferIds);
        
        if (contactsError) {
          console.error('Error fetching HR contacts:', contactsError);
          toast({
            title: 'Fehler',
            description: 'HR-Kontakte konnten nicht geladen werden',
            variant: 'destructive'
          });
          return;
        }
        
        console.log(`Fetched ${contactsData?.length || 0} HR contacts for job ${jobId} through partial match:`, contactsData);
        
        setJobContacts(prev => ({
          ...prev,
          [jobId]: contactsData as HRContact[] || []
        }));
        setLoadingContacts(prev => ({ ...prev, [jobId]: false }));
        return;
      }
      
      const jobOfferIds = jobOffersData.map(jo => jo.id);
      const { data: contacts, error: contactError } = await supabase
        .from('hr_contacts')
        .select('*')
        .in('job_offer_id', jobOfferIds);
      
      if (contactError) {
        console.error('Error fetching HR contacts:', contactError);
        toast({
          title: 'Fehler',
          description: 'HR-Kontakte konnten nicht geladen werden',
          variant: 'destructive'
        });
        return;
      }
      
      console.log(`Fetched ${contacts?.length || 0} HR contacts for job ${jobId}:`, contacts);
      
      setJobContacts(prev => ({
        ...prev,
        [jobId]: contacts as HRContact[] || []
      }));
    } catch (err) {
      console.error('Error loading HR contacts:', err);
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
