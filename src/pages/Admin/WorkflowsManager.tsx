
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, RefreshCw, Search, Share2, Edit, Tag, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowViewer } from '@/components/workflows/WorkflowViewer';
import { EditWorkflowForm } from '@/components/workflows/EditWorkflowForm';
import { WorkflowCard } from '@/components/workflows/WorkflowCard';

export default function WorkflowsManager() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  
  // Fetch workflows
  const { data: workflows, isLoading, error } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('n8n_workflows')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw new Error(error.message);
      return data;
    }
  });

  // Fetch companies for sharing
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

  // Sync workflows from n8n
  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/n8n-workflows?action=sync`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to sync workflows');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Workflows synced successfully',
        description: `${data.results?.length || 0} workflows processed`,
      });
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to sync workflows',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Share workflow with customer
  const shareMutation = useMutation({
    mutationFn: async ({ workflowId, companyId }) => {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/n8n-workflows`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'share',
          workflowId,
          data: { companyId }
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to share workflow');
      }
      
      return await response.json();
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

  // Update workflow local metadata
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

  // Filter workflows based on search term
  const filteredWorkflows = workflows?.filter(workflow => {
    return (
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
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

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Workflow Manager</h1>
        <div className="bg-destructive/20 p-4 rounded-md">
          <p className="text-destructive">Error loading workflows: {error.message}</p>
          <Button variant="outline" className="mt-2" onClick={() => queryClient.invalidateQueries({ queryKey: ['workflows'] })}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workflow Manager</h1>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            {syncMutation.isPending ? 'Syncing...' : 'Sync from n8n'}
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows by name, description or tags..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows?.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              {searchTerm ? 'No workflows match your search.' : 'No workflows found. Sync from n8n to get started.'}
            </div>
          ) : (
            filteredWorkflows?.map((workflow) => (
              <WorkflowCard 
                key={workflow.id}
                workflow={workflow}
                onView={() => {
                  setSelectedWorkflow(workflow);
                  setViewDialogOpen(true);
                }}
                onEdit={() => {
                  setSelectedWorkflow(workflow);
                  setEditDialogOpen(true);
                }}
                onShare={() => {
                  setSelectedWorkflow(workflow);
                  setShareDialogOpen(true);
                }}
              />
            ))
          )}
        </div>
      )}

      {/* Share Workflow Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Workflow with Customer</DialogTitle>
            <DialogDescription>
              Select a customer to share "{selectedWorkflow?.name}" workflow with.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCompanies ? (
                  <SelectItem value="loading" disabled>Loading companies...</SelectItem>
                ) : (
                  companies?.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleShareWorkflow}
              disabled={shareMutation.isPending || !selectedCompany}
            >
              {shareMutation.isPending ? 'Sharing...' : 'Share'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Workflow Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Workflow</DialogTitle>
            <DialogDescription>
              Update workflow details
            </DialogDescription>
          </DialogHeader>
          {selectedWorkflow && (
            <EditWorkflowForm 
              workflow={selectedWorkflow} 
              onSubmit={handleUpdateWorkflow} 
              isPending={updateWorkflowMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Workflow Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedWorkflow?.name}</DialogTitle>
            <DialogDescription>
              {selectedWorkflow?.description || 'No description provided'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedWorkflow && <WorkflowViewer workflow={selectedWorkflow} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
