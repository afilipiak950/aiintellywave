import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const FeatureDebug = () => {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [features, setFeatures] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
  
  useEffect(() => {
    checkFeatures();
  }, [user]);

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Feature Status Debug</h1>
      
      <div className="mb-4 flex justify-end">
        <Button 
          onClick={checkFeatures} 
          variant="outline" 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh Features
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User & Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">User ID</h3>
                <p className="font-mono text-sm">{user?.id}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Company ID</h3>
                <p className="font-mono text-sm">{companyId || 'Not associated with a company'}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Features Status</h3>
                {features ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span>Google Jobs:</span>
                      <Badge variant={features.google_jobs_enabled ? "default" : "outline"}>
                        {features.google_jobs_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div>
                      <span>Last Updated:</span>
                      <p className="font-mono text-sm">{new Date(features.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                ) : (
                  <p>No feature records found for this company.</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureDebug;
