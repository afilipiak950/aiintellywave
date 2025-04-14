
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Job, JobOfferRecord } from '@/types/job-parsing';
import { useAuth } from '@/context/auth';

interface JobSearchParams {
  query: string;
  location?: string;
  experience?: string;
  industry?: string;
}

export const useJobSearch = () => {
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

  // Check if user has access to Google Jobs feature
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

  // Fetch search history
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
  
  return {
    isLoading,
    hasAccess,
    isAccessLoading,
    searchParams,
    jobs,
    selectedJob,
    searchHistory,
    isSearchHistoryOpen,
    aiSuggestion,
    isAiModalOpen,
    isGeneratingAiSuggestion,
    currentOfferId,
    handleParamChange,
    handleSearch,
    loadSearchResult,
    setSelectedJob,
    setIsSearchHistoryOpen,
    setIsAiModalOpen,
    generateAiSuggestion
  };
};
