
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Job } from '@/types/job-parsing';

interface JobResultsTableProps {
  jobs: Job[];
  searchQuery: string;
  searchLocation?: string;
  onJobSelect: (job: Job) => void;
}

const JobResultsTable: React.FC<JobResultsTableProps> = ({
  jobs,
  searchQuery,
  searchLocation,
  onJobSelect
}) => {
  if (jobs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gefundene Jobangebote ({jobs.length})</CardTitle>
        <CardDescription>
          Ergebnisse für "{searchQuery}"
          {searchLocation && ` in ${searchLocation}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Position</TableHead>
                <TableHead>Unternehmen</TableHead>
                <TableHead>Standort</TableHead>
                <TableHead className="hidden md:table-cell">Details</TableHead>
                <TableHead className="text-right">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job, idx) => (
                <TableRow key={idx} className="cursor-pointer hover:bg-muted/50" onClick={() => onJobSelect(job)}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.company}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Button variant="ghost" size="sm">Details anzeigen</Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <a 
                      href={job.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobResultsTable;
