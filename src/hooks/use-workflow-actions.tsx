
import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useWorkflowActions() {
  const queryClient = useQueryClient();
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  
  // Fetch companies
  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name');
      
      if (error) throw new Error(error.message);
      return data;
    }
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: async ({ workflowId, companyId }) => {
      const { data, error } = await supabase.functions.invoke('n8n-workflows', {
        body: {
          action: 'share',
          workflowId,
          data: { companyId }
        }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to share workflow');
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Workflow shared successfully',
        description: 'The customer can now access this workflow'
      });
      setShareDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to share workflow',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Update workflow mutation
  const updateWorkflowMutation = useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { error } = await supabase
        .from('n8n_workflows')
        .update(data)
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      return { id, ...data };
    },
    onSuccess: () => {
      toast({
        title: 'Workflow updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to update workflow',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleShareWorkflow = () => {
    if (!selectedWorkflow || !selectedCompany) {
      toast({
        title: 'Selection required',
        description: 'Please select both a workflow and a company',
        variant: 'destructive'
      });
      return;
    }

    shareMutation.mutate({
      workflowId: selectedWorkflow.n8n_workflow_id,
      companyId: selectedCompany
    });
  };

  const handleUpdateWorkflow = (formData) => {
    if (!selectedWorkflow) return;
    
    updateWorkflowMutation.mutate({
      id: selectedWorkflow.id,
      ...formData
    });
  };

  return {
    selectedWorkflow,
    setSelectedWorkflow,
    shareDialogOpen,
    setShareDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    viewDialogOpen,
    setViewDialogOpen,
    selectedCompany,
    setSelectedCompany,
    companies,
    isLoadingCompanies,
    handleShareWorkflow,
    handleUpdateWorkflow,
    shareMutation,
    updateWorkflowMutation
  };
}
