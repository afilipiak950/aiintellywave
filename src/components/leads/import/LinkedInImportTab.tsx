
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createLeadData } from '@/services/leads';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle, Check } from 'lucide-react';
import { Lead } from '@/types/lead';

interface LinkedInImportTabProps {
  onLeadCreated: () => void;
  projectId?: string;
}

interface LinkedInProfile {
  name: string;
  position: string;
  company: string;
  location: string;
  extra_data: Record<string, any>;
}

const LinkedInImportTab = ({ onLeadCreated, projectId }: LinkedInImportTabProps) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  const [importComplete, setImportComplete] = useState(false);

  const isValidLinkedInUrl = (url: string): boolean => {
    return url.includes('linkedin.com/in/') && url.length > 25;
  };

  const handleScrapeProfile = async () => {
    if (!isValidLinkedInUrl(url)) {
      setError('Please enter a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/profile-name)');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('linkedin-scraper', {
        body: { url }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.profile) {
        setProfile(data.profile);
      } else {
        throw new Error('No profile data returned');
      }
    } catch (err) {
      console.error('Error scraping LinkedIn profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to scrape profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImportLead = async () => {
    if (!profile) return;
    
    setLoading(true);
    
    try {
      const leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'> = {
        name: profile.name,
        position: profile.position || null,
        company: profile.company || null,
        email: null, // LinkedIn doesn't provide email
        phone: null, // LinkedIn doesn't provide phone
        status: 'new',
        project_id: projectId || null,
        score: 0,
        tags: ['linkedin-import'],
        notes: `Imported from LinkedIn on ${new Date().toISOString().split('T')[0]}`,
        extra_data: profile.extra_data || null
      };

      await createLeadData(leadData);
      
      toast({
        title: "Lead Created",
        description: `Successfully imported ${profile.name} from LinkedIn`,
      });
      
      setImportComplete(true);
      onLeadCreated();
    } catch (err) {
      console.error('Error creating lead from LinkedIn profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUrl('');
    setProfile(null);
    setError(null);
    setImportComplete(false);
  };

  return (
    <div className="space-y-6 py-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {importComplete ? (
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="bg-green-100 rounded-full p-2">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-medium">Lead Successfully Imported</h3>
          <Button onClick={resetForm}>Import Another LinkedIn Profile</Button>
        </div>
      ) : profile ? (
        <div className="space-y-4">
          <div className="border rounded-md p-4 space-y-3">
            <h3 className="font-medium">Profile Preview</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm text-gray-500">Name</Label>
                <p>{profile.name}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Position</Label>
                <p>{profile.position || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Company</Label>
                <p>{profile.company || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Location</Label>
                <p>{profile.location || 'N/A'}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-500">LinkedIn URL</Label>
              <p className="text-xs text-blue-600 truncate">{url}</p>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={resetForm}>
              Back
            </Button>
            <Button onClick={handleImportLead} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Import as Lead
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
            <Input
              id="linkedin-url"
              placeholder="https://www.linkedin.com/in/profile-name"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Enter the full URL of the LinkedIn profile you want to import
            </p>
          </div>
          
          <Button 
            onClick={handleScrapeProfile} 
            disabled={loading || !url} 
            className="w-full"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? 'Fetching Profile...' : 'Fetch Profile Data'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LinkedInImportTab;
