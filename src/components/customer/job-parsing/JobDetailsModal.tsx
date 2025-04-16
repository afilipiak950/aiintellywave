
import React from 'react';
import { Job } from '@/types/job-parsing';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Building, MapPin, Calendar, Clock, Briefcase, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface JobDetailsModalProps {
  job: Job;
  onClose: () => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose }) => {
  // Format the date if available
  const formattedDate = job.datePosted
    ? typeof job.datePosted === 'string' 
        ? formatDistanceToNow(new Date(job.datePosted), { addSuffix: true, locale: de })
        : 'Nicht angegeben'
    : 'Nicht angegeben';

  // Ensure we have a valid URL for the job listing
  const getValidJobUrl = (url: string | undefined): string => {
    if (!url || url === '#') {
      // Create a Google search URL based on job title and company
      const searchQuery = encodeURIComponent(`${job.title} ${job.company} job`);
      return `https://www.google.com/search?q=${searchQuery}`;
    }
    
    // If URL doesn't start with http:// or https://, add https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    
    return url;
  };

  // Get the display URL (for showing to users)
  const getDisplayUrl = (url: string | undefined): string => {
    const validUrl = getValidJobUrl(url);
    // Show a shortened URL to make it more readable
    try {
      const urlObj = new URL(validUrl);
      return urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname : '');
    } catch (e) {
      return validUrl;
    }
  };

  // Handler for when the external link button is clicked
  const handleExternalLinkClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const validUrl = getValidJobUrl(job.url);
    window.open(validUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={!!job} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{job.title}</DialogTitle>
          <DialogDescription className="text-base flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-1">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>{job.company}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{job.location}</span>
            </div>
            {job.datePosted && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Gepostet {formattedDate}</span>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {job.employmentType && (
            <div className="flex items-center p-3 border rounded-md bg-muted/30">
              <Briefcase className="h-5 w-5 mr-2 text-primary" />
              <div>
                <div className="text-sm font-medium">Anstellungsart</div>
                <div className="text-muted-foreground">{job.employmentType}</div>
              </div>
            </div>
          )}
          
          {job.salary && (
            <div className="flex items-center p-3 border rounded-md bg-muted/30">
              <DollarSign className="h-5 w-5 mr-2 text-primary" />
              <div>
                <div className="text-sm font-medium">Gehalt</div>
                <div className="text-muted-foreground">{job.salary}</div>
              </div>
            </div>
          )}
          
          <div className="flex items-center p-3 border rounded-md bg-muted/30">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            <div>
              <div className="text-sm font-medium">Quelle</div>
              <div className="text-muted-foreground">{job.source || 'Google Jobs'}</div>
            </div>
          </div>
        </div>

        {/* Add a job URL section */}
        <div className="mb-4 p-3 border rounded-md bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center">
            <ExternalLink className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            <div className="text-sm font-medium overflow-hidden">
              <div>Job URL:</div>
              <a 
                href={getValidJobUrl(job.url)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline truncate inline-block max-w-full"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(getValidJobUrl(job.url), '_blank', 'noopener,noreferrer');
                }}
              >
                {getDisplayUrl(job.url)}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Beschreibung</h3>
          <div 
            dangerouslySetInnerHTML={{ __html: job.description }} 
            className="prose prose-sm max-w-none"
          />
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onClose}>
            Schließen
          </Button>
          <Button 
            onClick={handleExternalLinkClick}
            className="flex items-center"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Auf Original-Seite ansehen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsModal;
