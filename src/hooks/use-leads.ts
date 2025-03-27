
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadStatus } from '@/types/lead';
import { useAuth } from '@/context/auth';
import { toast } from '@/hooks/use-toast';

interface UseLeadsOptions {
  projectId?: string;
  status?: LeadStatus;
}

export const useLeads = (options: UseLeadsOptions = {}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [projectFilter, setProjectFilter] = useState<string | 'all'>('all');
  const { user } = useAuth();

  // Fetch leads data
  const fetchLeads = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('leads')
        .select(`
          *,
          projects:project_id (
            id,
            name,
            company_id,
            companies:company_id (
              id,
              name
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (options.projectId) {
        query = query.eq('project_id', options.projectId);
      }
      
      if (options.status) {
        query = query.eq('status', options.status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        const formattedLeads = data.map(lead => ({
          ...lead,
          project_name: lead.projects?.name || 'Unknown Project',
          company_name: lead.projects?.companies?.name || 'Unknown Company'
        }));
        
        setLeads(formattedLeads);
        setFilteredLeads(formattedLeads);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leads data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new lead
  const createLead = async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          ...lead,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        toast({
          title: 'Success',
          description: 'Lead created successfully',
        });
        fetchLeads();
        return data;
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to create lead. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Update an existing lead
  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        toast({
          title: 'Success',
          description: 'Lead updated successfully',
        });
        fetchLeads();
        return data;
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lead. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Delete a lead
  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Lead deleted successfully',
      });
      fetchLeads();
      return true;
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete lead. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Apply filters and search term to leads
  useEffect(() => {
    let results = [...leads];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(lead => lead.status === statusFilter);
    }
    
    // Apply project filter
    if (projectFilter !== 'all') {
      results = results.filter(lead => lead.project_id === projectFilter);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        lead =>
          lead.name.toLowerCase().includes(term) ||
          (lead.company && lead.company.toLowerCase().includes(term)) ||
          (lead.email && lead.email.toLowerCase().includes(term)) ||
          (lead.position && lead.position.toLowerCase().includes(term)) ||
          (lead.project_name && lead.project_name.toLowerCase().includes(term)) ||
          (lead.company_name && lead.company_name.toLowerCase().includes(term))
      );
    }
    
    setFilteredLeads(results);
  }, [leads, searchTerm, statusFilter, projectFilter]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user, options.projectId, options.status]);

  return {
    leads: filteredLeads,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    projectFilter,
    setProjectFilter,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead
  };
};
