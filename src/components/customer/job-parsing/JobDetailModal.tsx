
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, Building, MapPin, Clock, Briefcase, UserCircle, Linkedin } from 'lucide-react';
import { Job, HRContact } from '@/types/job-parsing';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, isOpen, onClose }) => {
  if (!job) return null;

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Nicht angegeben';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Kürzlich';
      
      return new Intl.DateTimeFormat('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch (e) {
      return 'Kürzlich';
    }
  };

  // Get HR contacts if available
  const hrContacts = job.hrContacts || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{job.title}</DialogTitle>
          <DialogDescription className="flex items-center text-base font-medium">
            <Building className="h-4 w-4 mr-2" />
            {job.company}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{job.location || 'Remote/Flexibel'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Veröffentlicht: {formatDate(job.datePosted)}</span>
          </div>
          
          {job.salary && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>Gehalt: {job.salary}</span>
            </div>
          )}
          
          {job.employmentType && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Beschäftigungsart: {job.employmentType}</span>
            </div>
          )}
        </div>
        
        <Separator />
        
        <div className="my-4 space-y-4">
          <h3 className="font-semibold text-lg">Stellenbeschreibung</h3>
          <div className="whitespace-pre-line text-sm">
            {job.description}
          </div>
        </div>
        
        {hrContacts.length > 0 && (
          <>
            <Separator />
            
            <div className="my-4 space-y-4">
              <div className="flex items-center">
                <UserCircle className="h-5 w-5 mr-2" />
                <h3 className="font-semibold text-lg">HR-Kontakte</h3>
                <Badge className="ml-2" variant="outline">{hrContacts.length} Kontakte gefunden</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hrContacts.map((contact, i) => (
                  <div key={i} className="p-3 bg-muted/30 rounded-lg border">
                    <div className="font-medium">{contact.full_name}</div>
                    <div className="text-sm text-muted-foreground">{contact.role}</div>
                    
                    {contact.department && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Abteilung: {contact.department}
                      </div>
                    )}
                    
                    {contact.seniority && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Seniorität: {contact.seniority}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {contact.email && (
                        <a href={`mailto:${contact.email}`} className="inline-flex items-center text-xs text-primary hover:underline">
                          <span className="i-lucide-mail h-3 w-3 mr-1" />
                          {contact.email}
                        </a>
                      )}
                      
                      {contact.phone && (
                        <a href={`tel:${contact.phone}`} className="inline-flex items-center text-xs text-primary hover:underline">
                          <span className="i-lucide-phone h-3 w-3 mr-1" />
                          {contact.phone}
                        </a>
                      )}
                      
                      {contact.linkedin_url && (
                        <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-primary hover:underline">
                          <Linkedin className="h-3 w-3 mr-1" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                    
                    {contact.source && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Quelle: {contact.source}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        <Separator />
        
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold">Quelle</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{job.source || 'Google Jobs'}</Badge>
          </div>
        </div>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Schließen</Button>
          <Button onClick={() => window.open(job.url, '_blank', 'noopener,noreferrer')}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Zum Job
          </Button>
          {job.directApplyLink && job.directApplyLink !== job.url && (
            <Button variant="default" onClick={() => window.open(job.directApplyLink, '_blank', 'noopener,noreferrer')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Direkt bewerben
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailModal;
