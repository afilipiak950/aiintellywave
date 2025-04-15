
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
import { ExternalLink, Building, MapPin, Info, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Job } from '@/types/job-parsing';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

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
  // Add debug log to check if the component receives jobs
  console.log('JobResultsTable rendering with jobs:', jobs);
  
  if (!jobs || jobs.length === 0) {
    return null;
  }

  // Check if we're showing fallback results
  const usingFallback = jobs.some(job => job.source === 'Fallback (Apify API nicht verfügbar)');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gefundene Jobangebote ({jobs.length})</CardTitle>
          {usingFallback && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
              <AlertCircle size={12} className="mr-1" /> Alternative Ergebnisse
            </Badge>
          )}
        </div>
        <CardDescription>
          Ergebnisse für "{searchQuery}"
          {searchLocation && ` in ${searchLocation}`}
          {usingFallback && ` (Google Jobs API eingeschränkt verfügbar)`}
        </CardDescription>
      </CardHeader>
      {usingFallback && (
        <div className="mx-6 mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
          <div className="flex items-center">
            <AlertCircle size={14} className="mr-2" />
            <p>Die Google Jobs API ist derzeit nicht verfügbar. Es werden alternative Jobergebnisse angezeigt.</p>
          </div>
        </div>
      )}
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
                  <TableCell>
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                      {job.company}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      {job.location}
                    </div>
                  </TableCell>
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
      <CardFooter className="text-xs text-muted-foreground">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Info className="h-3 w-3 mr-1" />
                {usingFallback 
                  ? "Alternative Ergebnisse aufgrund von API-Einschränkungen" 
                  : "Daten von Google Jobs über Apify"}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{usingFallback 
                ? "Der Google Jobs API-Dienst ist momentan nicht verfügbar. Wir zeigen alternative Jobangebote an."
                : "Die Jobangebote werden von Google Jobs abgerufen und zeigen nur einen Job pro Unternehmen."}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};

export default JobResultsTable;
