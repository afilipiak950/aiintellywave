
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Linkedin } from 'lucide-react';

interface LinkedInImportTabProps {
  onLeadCreated: () => void;
  projectId?: string;
}

const LinkedInImportTab = ({ onLeadCreated, projectId }: LinkedInImportTabProps) => {
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadCreated, setLeadCreated] = useState(false);
  const [profilePreview, setProfilePreview] = useState<any>(null);

  const scrapeLinkedInProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setProfilePreview(null);

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

      if (!data || !data.profile || !data.profile.name) {
        setError('Failed to extract data from the LinkedIn profile. The profile may be private or not accessible.');
        setIsLoading(false);
        return;
      }

      // Set profile preview for user to review
      setProfilePreview(data.profile);
      
    } catch (error) {
      console.error('Error in scrapeLinkedInProfile:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const createLeadFromProfile = async () => {
    if (!profilePreview) return;
    
    setIsLoading(true);
    
    try {
      // Create the lead object with the scraped data
      const leadData = {
        name: profilePreview.name || '',
        position: profilePreview.position || profilePreview.headline || '',
        company: profilePreview.company || null,
        email: null,
        phone: null,
        status: 'new' as const,
        project_id: projectId || '',
        score: 0,
        tags: ["linkedin-import"],
        notes: profilePreview.summary || '',
        last_contact: null,
        website: null,
        extra_data: {
          location: profilePreview.location,
          connections: profilePreview.connections,
          linkedin_url: profilePreview.extra_data?.linkedin_url,
          summary: profilePreview.summary,
          experience: profilePreview.experience,
          education: profilePreview.education,
          skills: profilePreview.skills
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
        return;
      }

      console.log('Lead created from LinkedIn data:', leadResult);
      setLeadCreated(true);
      if (onLeadCreated) onLeadCreated();

      // Clear form and success message after a delay
      setTimeout(() => {
        setLinkedInUrl('');
        setLeadCreated(false);
        setProfilePreview(null);
      }, 3000);

    } catch (error) {
      console.error('Error in createLeadFromProfile:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfilePreview = () => {
    if (!profilePreview) return null;

    return (
      <div className="mt-4 border rounded-md p-4 bg-slate-50">
        <h3 className="font-semibold text-lg mb-2">Profile Preview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p>{profilePreview.name}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Position</p>
            <p>{profilePreview.position || profilePreview.headline || 'N/A'}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Company</p>
            <p>{profilePreview.company || 'N/A'}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Location</p>
            <p>{profilePreview.location || 'N/A'}</p>
          </div>
        </div>

        {profilePreview.summary && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500">Summary</p>
            <p className="text-sm">{profilePreview.summary}</p>
          </div>
        )}

        {profilePreview.experience && profilePreview.experience.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500 mb-2">Experience</p>
            {profilePreview.experience.map((exp: any, index: number) => (
              <div key={`exp-${index}`} className="mb-2 pl-2 border-l-2 border-gray-200">
                <p className="font-medium text-sm">{exp.title} at {exp.company}</p>
                <p className="text-xs text-gray-500">{exp.duration}</p>
                {exp.description && <p className="text-xs mt-1">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {profilePreview.education && profilePreview.education.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500 mb-2">Education</p>
            {profilePreview.education.map((edu: any, index: number) => (
              <div key={`edu-${index}`} className="mb-2 pl-2 border-l-2 border-gray-200">
                <p className="font-medium text-sm">{edu.institution}</p>
                <p className="text-xs">{edu.degree}</p>
                <p className="text-xs text-gray-500">{edu.year}</p>
              </div>
            ))}
          </div>
        )}

        {profilePreview.skills && profilePreview.skills.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Skills</p>
            <div className="flex flex-wrap gap-1">
              {profilePreview.skills.map((skill: string, index: number) => (
                <span key={`skill-${index}`} className="text-xs bg-gray-200 px-2 py-1 rounded">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <Button onClick={createLeadFromProfile} className="mt-4" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating lead...
            </>
          ) : (
            'Create Lead from Profile'
          )}
        </Button>
      </div>
    );
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
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <div className="absolute left-2 top-2.5 text-muted-foreground">
                <Linkedin className="h-5 w-5" />
              </div>
              <Input
                id="linkedin-url"
                className="pl-9"
                placeholder="https://www.linkedin.com/in/..."
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button onClick={scrapeLinkedInProfile} disabled={isLoading}>
              {isLoading && !profilePreview ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                'Scrape Profile'
              )}
            </Button>
          </div>
        </div>
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {leadCreated && <p className="text-green-500 text-sm">Lead created successfully!</p>}
        
        {renderProfilePreview()}
      </CardContent>
    </Card>
  );
};

export default LinkedInImportTab;
