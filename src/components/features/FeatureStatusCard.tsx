
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleJobsToggle } from '@/components/features/GoogleJobsToggle';
import { Skeleton } from '@/components/ui/skeleton';

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
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Feature Status</CardTitle>
        <CardDescription>
          {companyId 
            ? `Manage feature flags for company: ${companyId}` 
            : 'No company associated with this user'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {loading ? (
            <FeaturesSkeleton />
          ) : companyId ? (
            <>
              {/* Google Jobs Toggle */}
              <GoogleJobsToggle 
                isEnabled={!!features?.google_jobs_enabled} 
                onToggle={onToggleGoogleJobs}
                isLoading={loading}
              />
              
              {/* Add more feature toggles here in the future */}
              
              <div className="text-xs text-muted-foreground mt-4 p-2 bg-muted/40 rounded">
                <p>User ID: {userId || 'Unknown'}</p>
                <p>Company ID: {companyId}</p>
                {features && (
                  <div className="mt-2">
                    <p className="font-medium">Feature status:</p>
                    <p>Google Jobs: {features.google_jobs_enabled ? 'Enabled' : 'Disabled'}</p>
                    <p>Last updated: {new Date(features.updated_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-amber-600 p-3 bg-amber-50 rounded-md">
              <p>No company associated with current user.</p>
              <p className="text-xs mt-1">User ID: {userId || 'Unknown'}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const FeaturesSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-6 w-12" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);
