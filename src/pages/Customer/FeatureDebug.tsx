import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, Settings, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const FeatureDebug = () => {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [features, setFeatures] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [repairing, setRepairing] = useState(false);

  const checkFeatures = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Get company ID first
      const { data: userData, error: userError } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', user.id)
        .single();
        
      if (userError) {
        console.error('Error fetching user company:', userError);
        setLoading(false);
        return;
      }
      
      setCompanyId(userData.company_id);
      
      if (!userData.company_id) {
        setLoading(false);
        return;
      }
      
      // Get company features
      const { data, error } = await supabase
        .from('company_features')
        .select('*')
        .eq('company_id', userData.company_id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching company features:', error);
      }
      
      console.log("Company features data:", data);
      setFeatures(data);
    } catch (err) {
      console.error('Error checking features:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const repairFeatures = async () => {
    if (!user || !companyId) return;
    
    setRepairing(true);
    
    try {
      // Check if record exists
      const { data, error } = await supabase
        .from('company_features')
        .select('id')
        .eq('company_id', companyId)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking feature record existence:', error);
        toast({
          title: "Error",
          description: "Could not check if feature record exists",
          variant: "destructive"
        });
        return;
      }
      
      let result;
      if (data?.id) {
        // Update existing record
        result = await supabase
          .from('company_features')
          .update({
            updated_at: new Date().toISOString(),
            // Keep current google_jobs_enabled status or default to false
            google_jobs_enabled: features?.google_jobs_enabled ?? false
          })
          .eq('company_id', companyId);
      } else {
        // Create new record
        result = await supabase
          .from('company_features')
          .insert({
            company_id: companyId,
            google_jobs_enabled: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
      
      if (result.error) {
        console.error('Error repairing features:', result.error);
        toast({
          title: "Repair Failed",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Repair Complete",
          description: "Feature settings have been repaired",
          variant: "default"
        });
        
        // Refresh
        await checkFeatures();
      }
    } catch (err) {
      console.error('Exception repairing features:', err);
      toast({
        title: "Repair Exception",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setRepairing(false);
    }
  };
  
  const toggleGoogleJobs = async () => {
    if (!user || !companyId || !features) return;
    
    setLoading(true);
    
    try {
      const newStatus = !features.google_jobs_enabled;
      
      const { error } = await supabase
        .from('company_features')
        .update({
          google_jobs_enabled: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', companyId);
        
      if (error) {
        console.error('Error toggling Google Jobs:', error);
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: newStatus ? "Google Jobs Enabled" : "Google Jobs Disabled",
          description: newStatus 
            ? "You should now see the Jobangebote menu item"
            : "The Jobangebote menu item will be hidden",
          variant: "default"
        });
        
        // Refresh data
        await checkFeatures();
      }
    } catch (err) {
      console.error('Exception toggling Google Jobs:', err);
      toast({
        title: "Toggle Exception",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    checkFeatures();
  }, [user]);

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Feature Status Debug</h1>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            onClick={checkFeatures} 
            variant="outline" 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh Features
          </Button>
          
          {companyId && (
            <Button
              onClick={repairFeatures}
              variant="default"
              disabled={repairing || loading}
              className="flex items-center gap-2"
            >
              <Settings size={16} className={repairing ? "animate-spin" : ""} />
              Repair Features
            </Button>
          )}
        </div>
      </div>
      
      {/* User association check */}
      {!companyId && !loading && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Company Association Missing</AlertTitle>
          <AlertDescription>
            Your user account is not associated with any company. Please contact support to resolve this issue.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Feature settings card */}
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
                      <p className="font-mono text-sm">{user?.id}</p>
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
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span>Google Jobs (Jobangebote):</span>
                            <Badge variant={features.google_jobs_enabled ? "default" : "outline"}>
                              {features.google_jobs_enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          
                          <Button 
                            size="sm" 
                            variant={features.google_jobs_enabled ? "destructive" : "default"}
                            onClick={toggleGoogleJobs}
                            disabled={loading}
                          >
                            {features.google_jobs_enabled ? "Disable" : "Enable"}
                          </Button>
                        </div>
                        
                        {features.google_jobs_enabled && (
                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Feature Enabled</AlertTitle>
                            <AlertDescription>
                              The Jobangebote feature is enabled. You should see it in your sidebar menu.
                              If it's not visible, try refreshing the page or use the "Repair Features" button.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                      
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
    </div>
  );
};

export default FeatureDebug;
