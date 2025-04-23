
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Lead } from '@/types/lead';
import { Project } from '@/types/project';

// Import components
import LeadDatabaseHeader from '@/components/customer/LeadDatabaseHeader';
import LeadDatabaseContainer from '@/components/customer/LeadDatabaseContainer';
import LeadErrorHandler from '@/components/leads/LeadErrorHandler';
import LeadDatabaseDebug from '@/components/leads/LeadDatabaseDebug';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Bug, Search } from 'lucide-react';

// Import utility functions
import {
  getProjectLeads,
  getUserProjects,
  getDiagnosticInfo
} from '@/components/leads/lead-error-utils';
import { supabase } from '@/integrations/supabase/client';

const LeadDatabase = () => {
  // State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  
  // Get user email for display
  useEffect(() => {
    const getUserEmail = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    };
    getUserEmail();
  }, []);
  
  // Load diagnostic info
  useEffect(() => {
    const loadDiagnostics = async () => {
      const info = await getDiagnosticInfo();
      setDiagnosticInfo(info);
    };
    loadDiagnostics();
  }, []);
  
  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projects = await getUserProjects();
        setProjects(projects);
      } catch (err) {
        console.error("Error loading projects:", err);
      }
    };
    loadProjects();
  }, []);
  
  // Load leads
  const fetchLeads = async () => {
    setIsLoading(true);
    setIsRetrying(true);
    setError(null);
    
    try {
      const projectId = projectFilter !== 'all' ? projectFilter : undefined;
      const leads = await getProjectLeads(projectId);
      setLeads(leads);
    } catch (err) {
      console.error("Error loading leads:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };
  
  // Initial data load
  useEffect(() => {
    fetchLeads();
  }, [projectFilter]); // Reload when project filter changes
  
  // Filter leads
  useEffect(() => {
    if (!leads) return;
    
    let result = [...leads];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(lead => 
        lead.name?.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.company?.toLowerCase().includes(searchLower)
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(lead => lead.status === statusFilter);
    }
    
    setFilteredLeads(result);
  }, [leads, searchTerm, statusFilter]);
  
  // Handle retry
  const handleRetryFetch = () => {
    fetchLeads();
    toast({
      title: "Lade Leads",
      description: "Die Leads werden neu geladen..."
    });
  };
  
  return (
    <LeadDatabaseContainer>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <LeadDatabaseHeader />
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRetryFetch}
            disabled={isLoading || isRetrying}
          >
            <RefreshCw className={`mr-1 h-4 w-4 ${isLoading || isRetrying ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            title="Debugging-Informationen anzeigen"
          >
            <Bug className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {userEmail && (
        <div className="px-4 py-3 mb-4 rounded-md bg-blue-50 border border-blue-100">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Benutzer:</span> {userEmail}
          </p>
        </div>
      )}
      
      {error && !isLoading && (
        <LeadErrorHandler 
          error={error}
          onRetry={handleRetryFetch}
          isRetrying={isRetrying}
        />
      )}
      
      {showDebug && (
        <LeadDatabaseDebug info={diagnosticInfo} error={error} />
      )}
      
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Leads durchsuchen..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 md:w-[400px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="new">Neu</SelectItem>
              <SelectItem value="contacted">Kontaktiert</SelectItem>
              <SelectItem value="qualified">Qualifiziert</SelectItem>
              <SelectItem value="negotiation">Verhandlung</SelectItem>
              <SelectItem value="won">Gewonnen</SelectItem>
              <SelectItem value="lost">Verloren</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Projekte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Projekte</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin">
            <RefreshCw className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      ) : filteredLeads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map(lead => (
            <div key={lead.id} className="border rounded-md p-4 hover:bg-muted/20 transition-colors">
              <h3 className="font-medium">{lead.name}</h3>
              {lead.company && <p className="text-sm text-muted-foreground">{lead.company}</p>}
              {lead.email && <p className="text-sm">{lead.email}</p>}
              <div className="mt-2 flex justify-between">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {lead.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 border rounded-lg bg-muted/10">
          <h3 className="text-lg font-medium mb-2">Keine Leads gefunden</h3>
          <p className="text-muted-foreground mb-4">
            Es wurden keine Leads gefunden, die Ihren Filterkriterien entsprechen.
          </p>
          <Button variant="outline" onClick={handleRetryFetch}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Erneut laden
          </Button>
        </div>
      )}
    </LeadDatabaseContainer>
  );
};

export default LeadDatabase;
