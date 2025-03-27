
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SuggestionItem, SuggestionGroup } from '@/components/ui/search/SmartSuggestions';
import { useDebounce } from '@/hooks/use-debounce';

export function useSmartSearch() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionGroup[]>([]);
  
  const debouncedQuery = useDebounce(query, 300);

  const searchItems = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Search for projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, description, status, company_id')
        .ilike('name', `%${searchQuery}%`)
        .limit(5);
      
      if (projectsError) throw projectsError;
      
      // Search for leads
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('id, name, company, project_id, position')
        .or(`name.ilike.%${searchQuery}%, company.ilike.%${searchQuery}%`)
        .limit(5);
      
      if (leadsError) throw leadsError;
      
      // Prepare suggestions by group
      const suggestionGroups: SuggestionGroup[] = [];
      
      // Projects group
      if (projects && projects.length > 0) {
        suggestionGroups.push({
          type: 'projects',
          label: 'Projects',
          items: projects.map(project => ({
            id: project.id,
            title: project.name,
            type: 'project',
            path: `/customer/projects/${project.id}`,
            description: project.description || `Status: ${project.status}`,
          })),
        });
      }
      
      // Leads group
      if (leads && leads.length > 0) {
        suggestionGroups.push({
          type: 'leads',
          label: 'Leads',
          items: leads.map(lead => ({
            id: lead.id,
            title: lead.name,
            type: 'lead',
            path: `/customer/lead-database?highlight=${lead.id}`,
            description: lead.company ? `Company: ${lead.company}` : lead.position,
          })),
        });
      }
      
      // Set suggestions
      setSuggestions(suggestionGroups);
    } catch (err) {
      console.error('Error searching items:', err);
      setError('Failed to search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Search when debounced query changes
  useEffect(() => {
    searchItems(debouncedQuery);
  }, [debouncedQuery, searchItems]);
  
  return {
    query,
    setQuery,
    isLoading,
    error,
    suggestions,
    searchItems,
  };
}
