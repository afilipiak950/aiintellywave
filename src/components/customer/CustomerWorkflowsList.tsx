
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CustomerWorkflowsList = () => {
  // Fetch customer workflows
  const { data: workflows, isLoading, error } = useQuery({
    queryKey: ['customer-workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_workflows')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Workflows</CardTitle>
          <CardDescription>Access your automated workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex p-4 border rounded-md">
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-24 h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Workflows</CardTitle>
          <CardDescription>Access your automated workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-4 rounded-md text-red-800">
            <p>There was an error loading your workflows.</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Workflows</CardTitle>
        <CardDescription>Access your automated workflows</CardDescription>
      </CardHeader>
      <CardContent>
        {workflows && workflows.length > 0 ? (
          <div className="space-y-2">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="flex justify-between items-center p-4 border rounded-md">
                <div>
                  <h3 className="font-medium">{workflow.name}</h3>
                  <p className="text-sm text-muted-foreground">{workflow.description || 'No description'}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => window.open(workflow.url, '_blank')}>
                  Open
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>You don't have any workflows yet.</p>
            <p className="text-sm mt-1">Workflows shared with you will appear here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerWorkflowsList;
