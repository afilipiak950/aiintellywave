
import React, { useState } from 'react';
import { useSimpleLeads } from '@/hooks/use-simple-leads';
import { LeadList } from '@/components/leads/LeadList';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Grid, List } from 'lucide-react';
import ViewToggle from '@/components/ui/project/leads/ViewToggle';
import SimpleLeadCard from '@/components/leads/SimpleLeadCard';

const LeadDatabase = () => {
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('list');
  
  const {
    leads,
    projects,
    selectedProject,
    setSelectedProject,
    isLoading,
    error,
  } = useSimpleLeads();

  const handleLeadClick = (lead: any) => {
    console.log('Lead clicked:', lead);
  };

  const renderLeads = () => {
    if (isLoading) {
      return (
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
      );
    }

    if (error) {
      return (
        <div className="text-center p-12 border rounded-lg bg-muted/10">
          <h3 className="text-lg font-medium mb-2">Fehler beim Laden</h3>
          <p className="text-muted-foreground mb-4">
            Die Leads konnten nicht geladen werden. Bitte versuchen Sie es später erneut.
          </p>
        </div>
      );
    }

    if (leads.length === 0) {
      return (
        <div className="text-center p-12 border rounded-lg bg-muted/10">
          <h3 className="text-lg font-medium mb-2">Keine Leads gefunden</h3>
          <p className="text-muted-foreground mb-4">
            Es wurden keine Leads für {selectedProject === 'all' ? 'alle Projekte' : 'dieses Projekt'} gefunden.
          </p>
        </div>
      );
    }

    return viewMode === 'list' ? (
      <LeadList leads={leads} onLeadClick={handleLeadClick} />
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leads.map((lead) => (
          <SimpleLeadCard 
            key={lead.id} 
            lead={lead} 
            onClick={() => handleLeadClick(lead)}
          />
        ))}
      </div>
    );
  };

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
          
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
      </div>

      {renderLeads()}
    </div>
  );
};

export default LeadDatabase;
