
import React from 'react';
import { useAuth } from '@/context/auth';
import { CustomerWorkflowsList } from '@/components/customer/CustomerWorkflowsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomerWorkflows() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Email Campaigns</h1>
        <p className="text-muted-foreground mt-1">
          View the performance of your email campaigns
        </p>
      </div>
      
      {user?.companyId ? (
        <CustomerWorkflowsList companyId={user.companyId} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Company Assigned</CardTitle>
            <CardDescription>
              You need to be associated with a company to view email campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Please contact your administrator to assign you to a company.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
