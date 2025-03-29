import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface LinkedInImportTabProps {
  onLeadCreated: () => void;
  projectId?: string;
}

const LinkedInImportTab = ({ onLeadCreated, projectId }: LinkedInImportTabProps) => {
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadCreated, setLeadCreated] = useState(false);

  const scrapeLinkedInProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!linkedInUrl || !linkedInUrl.includes('linkedin.com/in/')) {
        setError('Please enter a valid LinkedIn profile URL');
        setIsLoading(false);
        return;
      }

      // Call the Supabase Edge Function to scrape the LinkedIn profile
      const { data, error } = await supabase.functions.invoke('linkedin-scraper', {
        body: { url: linkedInUrl }
      });

      if (error) {
        console.error('Error calling LinkedIn scraper:', error);
        setError('Failed to scrape LinkedIn profile. Please try again.');
        setIsLoading(false);
        return;
      }

      if (!data || !data.name) {
        setError('Failed to extract data from the LinkedIn profile. The profile may be private or not accessible.');
        setIsLoading(false);
        return;
      }

      // Create the lead object with the scraped data
      const leadData = {
        name: data.name || '',
        position: data.headline || '',
        company: data.company || '',
        email: null,
        phone: null,
        status: 'new' as const,
        project_id: projectId || '',
        score: 0,
        tags: [],
        notes: data.summary || '',
        last_contact: null,
        website: null,
        extra_data: {
          location: data.location,
          connections: data.connections,
          profileUrl: linkedInUrl,
          // Add other LinkedIn fields
          ...data
        }
      };

      // Insert the lead into the database
      const { data: leadResult, error: insertError } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating lead from LinkedIn data:', insertError);
        setError('Failed to create lead from LinkedIn data.');
        setIsLoading(false);
        return;
      }

      console.log('Lead created from LinkedIn data:', leadResult);
      setLeadCreated(true);
      if (onLeadCreated) onLeadCreated();

      // Clear form and success message after a delay
      setTimeout(() => {
        setLinkedInUrl('');
        setLeadCreated(false);
      }, 3000);

    } catch (error) {
      console.error('Error in scrapeLinkedInProfile:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import from LinkedIn Profile</CardTitle>
        <CardDescription>
          Enter a LinkedIn profile URL to automatically import lead details.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
          <Input
            id="linkedin-url"
            placeholder="https://www.linkedin.com/in/..."
            value={linkedInUrl}
            onChange={(e) => setLinkedInUrl(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button onClick={scrapeLinkedInProfile} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scraping...
            </>
          ) : (
            'Scrape Profile'
          )}
        </Button>
        {error && <p className="text-red-500">{error}</p>}
        {leadCreated && <p className="text-green-500">Lead created successfully!</p>}
      </CardContent>
    </Card>
  );
};

export default LinkedInImportTab;
