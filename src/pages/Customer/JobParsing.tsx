import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ExternalLink, BriefcaseBusiness, MapPin, Building, Search, XCircle, Clock, Loader2, BrainCircuit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import JobDetailsModal from '@/components/customer/job-parsing/JobDetailsModal';
import AIContactSuggestionModal from '@/components/customer/job-parsing/AIContactSuggestionModal';
import { Job, JobOfferRecord } from '@/types/job-parsing';

interface JobSearchParams {
  query: string;
  location?: string;
  experience?: string;
  industry?: string;
}

const JobParsing = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [isAccessLoading, setIsAccessLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<JobSearchParams>({ query: '' });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchHistory, setSearchHistory] = useState<JobOfferRecord[]>([]);
  const [isSearchHistoryOpen, setIsSearchHistoryOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGeneratingAiSuggestion, setIsGeneratingAiSuggestion] = useState(false);
  const [currentOfferId, setCurrentOfferId] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) return;

      try {
        const { data: userData, error: userError } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', user.id)
          .single();
        
        if (userError) throw userError;
        
        if (!userData.company_id) {
          setIsAccessLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('company_features')
          .select('google_jobs_enabled')
          .eq('company_id', userData.company_id)
          .single();
          
        if (error && error.code !== 'PGRST116') throw error;
        
        setHasAccess(data?.google_jobs_enabled || false);
      } catch (err) {
        console.error('Error checking access:', err);
        toast({
          variant: 'destructive',
          title: 'Fehler',
          description: 'Berechtigungsprüfung fehlgeschlagen.'
        });
      } finally {
        setIsAccessLoading(false);
      }
    };
    
    checkAccess();
  }, [user, toast]);

  useEffect(() => {
    const fetchSearchHistory = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('customer_job_offers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        const typedResults = data?.map(record => {
          const searchResults = Array.isArray(record.search_results) 
            ? record.search_results.map((job: any) => ({
                title: job.title || '',
                company: job.company || '',
                location: job.location || '',
                description: job.description || '',
                url: job.url || '',
                datePosted: job.datePosted
              } as Job))
            : [];
            
          return {
            id: record.id,
            company_id: record.company_id,
            user_id: record.user_id,
            search_query: record.search_query,
            search_location: record.search_location,
            search_experience: record.search_experience,
            search_industry: record.search_industry,
            search_results: searchResults,
            ai_contact_suggestion: record.ai_contact_suggestion,
            created_at: record.created_at,
            updated_at: record.updated_at
          } as JobOfferRecord;
        }) || [];
        
        setSearchHistory(typedResults);
      } catch (err) {
        console.error('Error fetching search history:', err);
      }
    };
    
    fetchSearchHistory();
  }, [user]);

  const handleParamChange = (key: keyof JobSearchParams, value: string) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = async () => {
    if (!searchParams.query.trim()) {
      toast({
        variant: 'destructive',
        title: 'Suchbegriff erforderlich',
        description: 'Bitte geben Sie einen Suchbegriff ein.'
      });
      return;
    }
    
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentifizierung erforderlich',
        description: 'Bitte melden Sie sich an, um diese Funktion zu nutzen.'
      });
      return;
    }

    setIsLoading(true);
    setJobs([]);
    
    try {
      const { data: userData, error: userError } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', user.id)
        .single();
      
      if (userError) throw userError;
      
      if (!userData.company_id) {
        throw new Error('Keine Unternehmenszuordnung gefunden');
      }

      const response = await supabase.functions.invoke('google-jobs-scraper', {
        body: {
          searchParams: {
            query: searchParams.query,
            location: searchParams.location,
            experience: searchParams.experience,
            industry: searchParams.industry,
            maxResults: 100
          },
          companyId: userData.company_id,
          userId: user.id
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'API-Fehler');
      }
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      setJobs(response.data.data.results || []);
      setCurrentOfferId(response.data.data.id);
      
      const { data, error } = await supabase
        .from('customer_job_offers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const typedResults = data?.map(record => {
        const searchResults = Array.isArray(record.search_results) 
          ? record.search_results.map((job: any) => ({
              title: job.title || '',
              company: job.company || '',
              location: job.location || '',
              description: job.description || '',
              url: job.url || '',
              datePosted: job.datePosted
            } as Job))
          : [];
          
        return {
          id: record.id,
          company_id: record.company_id,
          user_id: record.user_id,
          search_query: record.search_query,
          search_location: record.search_location,
          search_experience: record.search_experience,
          search_industry: record.search_industry,
          search_results: searchResults,
          ai_contact_suggestion: record.ai_contact_suggestion,
          created_at: record.created_at,
          updated_at: record.updated_at
        } as JobOfferRecord;
      }) || [];
      
      setSearchHistory(typedResults);
      
      toast({
        title: 'Suche abgeschlossen',
        description: `${response.data.data.results.length} Jobangebote gefunden.`
      });
    } catch (err: any) {
      console.error('Error searching jobs:', err);
      toast({
        variant: 'destructive',
        title: 'Fehler bei der Suche',
        description: err.message || 'Ein unerwarteter Fehler ist aufgetreten.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSearchResult = (record: JobOfferRecord) => {
    setSearchParams({
      query: record.search_query,
      location: record.search_location || undefined,
      experience: record.search_experience || undefined,
      industry: record.search_industry || undefined
    });
    setJobs(record.search_results || []);
    setCurrentOfferId(record.id);
    setAiSuggestion(record.ai_contact_suggestion);
    setIsSearchHistoryOpen(false);
  };

  const openJobDetails = (job: Job) => {
    setSelectedJob(job);
  };

  const closeJobDetails = () => {
    setSelectedJob(null);
  };

  const generateAiSuggestion = async () => {
    if (!currentOfferId || jobs.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Keine Jobdaten',
        description: 'Führen Sie zuerst eine Jobsuche durch.'
      });
      return;
    }
    
    setIsGeneratingAiSuggestion(true);
    
    try {
      const suggestion = {
        contactStrategy: {
          title: "LinkedIn Kontaktaufnahme",
          description: "Basierend auf den Jobangeboten empfehle ich, den HR Manager über LinkedIn zu kontaktieren.",
          steps: [
            "Finden Sie den HR Manager auf LinkedIn",
            "Senden Sie eine personalisierte Verbindungsanfrage",
            "Erwähnen Sie spezifische Qualifikationen, die zu den ausgeschriebenen Stellen passen"
          ]
        },
        potentialContacts: [
          {
            name: "Maria Schmidt",
            role: "HR Manager",
            company: jobs[0]?.company || "Unbekannt",
            confidence: 0.85,
            contactStrategy: "LinkedIn InMail"
          }
        ],
        messageSuggestion: `Sehr geehrte/r [Name],\n\nIch bin auf Ihre Stellenausschreibung "${jobs[0]?.title}" aufmerksam geworden und möchte mich als qualifizierter Kandidat vorstellen. Meine Erfahrung in [relevante Erfahrung] passt hervorragend zu Ihren Anforderungen.\n\nIch würde mich freuen, mehr über die Position zu erfahren.\n\nMit freundlichen Grüßen`
      };
      
      const { error } = await supabase
        .from('customer_job_offers')
        .update({ ai_contact_suggestion: suggestion })
        .eq('id', currentOfferId);
        
      if (error) throw error;
      
      setAiSuggestion(suggestion);
      setIsAiModalOpen(true);
      
      toast({
        title: 'KI-Vorschlag generiert',
        description: 'Der Kontaktvorschlag wurde erfolgreich erstellt.'
      });
    } catch (err: any) {
      console.error('Error generating AI suggestion:', err);
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: err.message || 'Fehler bei der KI-Vorschlag-Generierung.'
      });
    } finally {
      setIsGeneratingAiSuggestion(false);
    }
  };

  if (isAccessLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Lade...</span>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Kein Zugriff</CardTitle>
          <CardDescription>
            Die Google Jobs Funktion ist für Ihr Konto nicht aktiviert.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <XCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="mb-4">
              Bitte kontaktieren Sie Ihren Administrator, um Zugang zu dieser Funktion zu erhalten.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Google Jobs Dashboard</h1>
          <p className="text-muted-foreground">
            Durchsuchen Sie aktuelle Stellenangebote und finden Sie passende Kontakte.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsSearchHistoryOpen(!isSearchHistoryOpen)}
            className="flex items-center gap-1"
          >
            <Clock className="h-4 w-4" />
            Suchverlauf
          </Button>
          
          {jobs.length > 0 && (
            <Button 
              variant="secondary" 
              onClick={generateAiSuggestion}
              disabled={isGeneratingAiSuggestion}
              className="flex items-center gap-1"
            >
              {isGeneratingAiSuggestion ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BrainCircuit className="h-4 w-4" />
              )}
              KI-Kontaktvorschlag
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Jobangebote suchen</CardTitle>
          <CardDescription>
            Geben Sie Suchkriterien ein, um relevante Jobangebote zu finden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="query">Suchbegriff</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="query"
                  placeholder="z.B. Project Manager, Software Developer"
                  value={searchParams.query}
                  onChange={(e) => handleParamChange('query', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Standort</Label>
              <div className="relative">
                <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="z.B. Berlin, Remote"
                  value={searchParams.location || ''}
                  onChange={(e) => handleParamChange('location', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience">Berufserfahrung</Label>
              <Select
                value={searchParams.experience || ''}
                onValueChange={(value) => handleParamChange('experience', value)}
              >
                <SelectTrigger id="experience">
                  <SelectValue placeholder="Beliebig" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Beliebig</SelectItem>
                  <SelectItem value="entry_level">Einsteiger</SelectItem>
                  <SelectItem value="mid_level">Erfahren</SelectItem>
                  <SelectItem value="senior_level">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Branche</Label>
              <div className="relative">
                <Building className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="industry"
                  placeholder="z.B. Technologie, Finanzen"
                  value={searchParams.industry || ''}
                  onChange={(e) => handleParamChange('industry', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleSearch} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suche läuft...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Jobangebote suchen
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Gefundene Jobangebote ({jobs.length})</CardTitle>
            <CardDescription>
              Ergebnisse für "{searchParams.query}"
              {searchParams.location && ` in ${searchParams.location}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Position</TableHead>
                    <TableHead>Unternehmen</TableHead>
                    <TableHead>Standort</TableHead>
                    <TableHead className="hidden md:table-cell">Details</TableHead>
                    <TableHead className="text-right">Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job, idx) => (
                    <TableRow key={idx} className="cursor-pointer hover:bg-muted/50" onClick={() => openJobDetails(job)}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.company}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Button variant="ghost" size="sm">Details anzeigen</Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <a 
                          href={job.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
      
      {isSearchHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Suchverlauf</CardTitle>
              <CardDescription>
                Frühere Suchanfragen und Ergebnisse
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[60vh] overflow-y-auto">
              {searchHistory.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">Keine Suchhistorie vorhanden</p>
              ) : (
                <div className="space-y-4">
                  {searchHistory.map((record) => (
                    <div 
                      key={record.id} 
                      className="border rounded-md p-3 hover:bg-muted/50 cursor-pointer"
                      onClick={() => loadSearchResult(record)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{record.search_query}</h4>
                        <Badge variant="outline">{record.search_results?.length || 0} Jobs</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {record.search_location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{record.search_location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {new Date(record.created_at).toLocaleDateString()} um{' '}
                            {new Date(record.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={() => setIsSearchHistoryOpen(false)}>
                Schließen
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {selectedJob && (
        <JobDetailsModal job={selectedJob} onClose={closeJobDetails} />
      )}
      
      {isAiModalOpen && aiSuggestion && (
        <AIContactSuggestionModal 
          suggestion={aiSuggestion} 
          onClose={() => setIsAiModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default JobParsing;
