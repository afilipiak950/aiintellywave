
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowViewer } from '@/components/workflows/WorkflowViewer';

export default function CustomerWorkflows() {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Fetch shared workflows for the current customer
  const { data: workflows, isLoading, error } = useQuery({
    queryKey: ['customer-workflows'],
    queryFn: async () => {
      // First get company_id for the current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: companyUser, error: companyUserError } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', userData.user.id)
        .single();
      
      if (companyUserError) throw companyUserError;

      // Then get all workflows shared with this company
      const { data: customerWorkflows, error: workflowError } = await supabase
        .from('customer_workflows')
        .select(`
          id,
          created_at,
          workflow:workflow_id (
            id,
            name,
            description,
            tags,
            data,
            created_at,
            updated_at
          )
        `)
        .eq('company_id', companyUser.company_id);
      
      if (workflowError) throw workflowError;
      return customerWorkflows;
    }
  });

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Automation Workflows</h1>
        <div className="bg-destructive/20 p-4 rounded-md">
          <p className="text-destructive">Error loading workflows: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Automation Workflows</h1>
          <p className="text-muted-foreground mt-1">
            Interactive visualizations of your automation processes
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
              <CardFooter className="pt-3">
                <Skeleton className="h-8 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {workflows?.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-lg">
              <Info className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No workflows available</h3>
              <p className="text-muted-foreground mt-2">
                There are currently no automation workflows shared with you.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflows?.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle>{item.workflow.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {item.workflow.description || 'No description provided'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.workflow.tags && item.workflow.tags.length > 0 ? (
                        item.workflow.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))
                      ) : null}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center mb-1">
                        <Calendar className="h-3 w-3 mr-2" />
                        <span>Shared on {new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-2" />
                        <span>Last updated {new Date(item.workflow.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => {
                        setSelectedWorkflow(item.workflow);
                        setViewDialogOpen(true);
                      }}
                    >
                      View Workflow
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

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
            {selectedWorkflow && (
              <WorkflowViewer workflow={selectedWorkflow} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
