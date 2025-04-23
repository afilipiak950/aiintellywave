
import React from 'react';
import { useSimpleLeads } from '@/hooks/use-simple-leads';
import SimpleLeadCard from '@/components/leads/SimpleLeadCard';
import SimpleLeadError from '@/components/leads/SimpleLeadError';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const LeadDatabase = () => {
  const {
    leads,
    projects,
    selectedProject,
    setSelectedProject,
    isLoading,
    error,
    handleRetry,
    retryCount
  } = useSimpleLeads();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lead Datenbank</h1>
          <p className="text-muted-foreground">Verwalten und verfolgen Sie alle Leads in Ihren Projekten</p>
        </div>

        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Select
            value={selectedProject}
            onValueChange={setSelectedProject}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Projekt wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Alle Projekte</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={handleRetry}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
        </div>
      </div>

      {error && (
        <SimpleLeadError 
          message={error.message}
          onRetry={handleRetry}
          isRetrying={isLoading}
        />
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <div key={index} className="border rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : leads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <SimpleLeadCard 
              key={lead.id} 
              lead={lead} 
              onClick={() => console.log('Lead angeklickt:', lead)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 border rounded-lg bg-muted/10">
          <h3 className="text-lg font-medium mb-2">Keine Leads gefunden</h3>
          <p className="text-muted-foreground mb-4">
            Es wurden keine Leads für {selectedProject === 'all' ? 'alle Projekte' : 'dieses Projekt'} gefunden.
          </p>
          <Button variant="outline" onClick={handleRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Erneut laden
          </Button>
        </div>
      )}
    </div>
  );
};

export default LeadDatabase;
