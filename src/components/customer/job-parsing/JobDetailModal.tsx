
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Job } from '@/types/job-parsing';

interface JobDetailModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{job.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p><strong>Company:</strong> {job.company}</p>
          <p><strong>Location:</strong> {job.location}</p>
          <p><strong>Description:</strong> {job.description}</p>
          {job.salary && <p><strong>Salary:</strong> {job.salary}</p>}
          {job.employmentType && <p><strong>Employment Type:</strong> {job.employmentType}</p>}
          {job.datePosted && (
            <p>
              <strong>Date Posted:</strong>{' '}
              {new Date(job.datePosted).toLocaleDateString()}
            </p>
          )}
          <div className="flex justify-end mt-4">
            <a 
              href={job.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition-colors"
            >
              View Job Offer
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailModal;
