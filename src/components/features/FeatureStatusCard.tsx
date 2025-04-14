
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { GoogleJobsToggle } from './GoogleJobsToggle';

interface FeatureStatusCardProps {
  loading: boolean;
  userId: string | undefined;
  companyId: string | null;
  features: any;
  onToggleGoogleJobs: () => Promise<void>;
}

export const FeatureStatusCard = ({ 
  loading, 
  userId, 
  companyId, 
  features, 
  onToggleGoogleJobs 
}: FeatureStatusCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User & Company Information</CardTitle>
        <CardDescription>
          This page helps diagnose feature visibility issues. If features are not showing correctly, 
          you can repair feature settings here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">User Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-muted-foreground">User ID:</span>
                    <p className="font-mono text-sm">{userId}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Company ID:</span>
                    <p className="font-mono text-sm">{companyId || 'Not associated with a company'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Feature Status</h3>
                {features ? (
                  <div className="space-y-4">
                    <GoogleJobsToggle 
                      isEnabled={features.google_jobs_enabled} 
                      onToggle={onToggleGoogleJobs}
                      isLoading={loading}
                    />
                    
                    <div>
                      <span className="text-muted-foreground">Last Updated:</span>
                      <p className="font-mono text-sm">{new Date(features.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>No Feature Record</AlertTitle>
                    <AlertDescription>
                      No feature configuration found for your company.
                      Click "Repair Features" to create the default configuration.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
