
import React from 'react';
import { X, MapPin, Calendar, Building, BriefcaseBusiness, Clock } from 'lucide-react';

interface Job {
  title: string;
  company: string;
  location: string;
  url: string;
  description?: string;
  detailsUrl?: string;
  salary?: string;
  posted?: string;
  jobType?: string;
  industry?: string;
}

interface JobDetailsModalProps {
  job: Job;
  onClose: () => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{job.title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-grow p-6">
          <div className="grid gap-6">
            <div className="space-y-3">
              <div className="flex items-center text-lg">
                <Building className="h-5 w-5 mr-2 text-blue-600" />
                <span className="font-medium">{job.company}</span>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                <span>{job.location}</span>
              </div>
              
              {job.jobType && (
                <div className="flex items-center">
                  <BriefcaseBusiness className="h-5 w-5 mr-2 text-blue-600" />
                  <span>{job.jobType}</span>
                </div>
              )}
              
              {job.posted && (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  <span>Veröffentlicht: {job.posted}</span>
                </div>
              )}
              
              {job.salary && (
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  <span>Gehalt: {job.salary}</span>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Beschreibung</h3>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {job.description ? (
                  <div dangerouslySetInnerHTML={{ __html: job.description }} />
                ) : (
                  <p className="text-gray-500 italic">
                    Keine detaillierte Beschreibung verfügbar. Bitte klicken Sie auf den Link unten, um die vollständige Stellenanzeige zu sehen.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-end">
          <a 
            href={job.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
          >
            Stellenanzeige öffnen
          </a>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
