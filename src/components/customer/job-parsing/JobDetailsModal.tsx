
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
    ? formatDistanceToNow(new Date(job.datePosted), { addSuffix: true, locale: de })
    : 'Nicht angegeben';

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
              <div className="text-muted-foreground">Google Jobs</div>
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
            onClick={() => window.open(job.url, '_blank', 'noopener,noreferrer')}
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
