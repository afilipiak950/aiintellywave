
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, Building, MapPin, Briefcase } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Job } from '@/types/job-parsing';

interface JobDetailsModalProps {
  job: Job;
  onClose: () => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose }) => {
  // Format the date if available
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unbekannt';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('de-DE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Dialog open={!!job} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{job.title}</DialogTitle>
          <DialogDescription className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
            <span className="flex items-center">
              <Building className="h-4 w-4 mr-1.5" />
              {job.company}
            </span>
            <span className="hidden sm:inline mx-1">•</span>
            <span className="flex items-center">
              <MapPin className="h-4 w-4 mr-1.5" />
              {job.location}
            </span>
            {job.datePosted && (
              <>
                <span className="hidden sm:inline mx-1">•</span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  {formatDate(job.datePosted)}
                </span>
              </>
            )}
            {job.employmentType && (
              <>
                <span className="hidden sm:inline mx-1">•</span>
                <span className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1.5" />
                  {job.employmentType}
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <Separator className="my-4" />
        
        {job.salary && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-1">Gehalt</h3>
            <p>{job.salary}</p>
            <Separator className="my-4" />
          </div>
        )}
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Stellenbeschreibung</h3>
          <div 
            className="job-description text-sm prose max-w-none" 
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </div>
        
        <DialogFooter className="mt-6 gap-2 sm:gap-0">
          <a 
            href={job.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button className="w-full sm:w-auto">
              Auf Original-Stellenanzeige bewerben
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </a>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Schließen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsModal;
