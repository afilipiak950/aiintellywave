
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchParams } from '@/hooks/job-parsing/state/useJobSearchState';
import { SearchIcon, AlertTriangle } from 'lucide-react';

interface JobSearchProps {
  searchParams: SearchParams;
  onParamChange: (name: string, value: string | number) => void;
  onSearch: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  retryCount: number;
}

const JobSearch: React.FC<JobSearchProps> = ({
  searchParams,
  onParamChange,
  onSearch,
  isLoading,
  error,
  retryCount
}) => {
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onParamChange(name, value);
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    onParamChange(name, value);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, triggering job search');
    onSearch();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jobangebote suchen</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="query">Suchbegriff</Label>
              <Input
                id="query"
                name="query"
                placeholder="z.B. Projektmanager IT"
                value={searchParams.query}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Standort (optional)</Label>
              <Input
                id="location"
                name="location"
                placeholder="z.B. Berlin oder Deutschland"
                value={searchParams.location}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience">Berufserfahrung (optional)</Label>
              <Select 
                value={searchParams.experience} 
                onValueChange={(value) => handleSelectChange('experience', value)}
              >
                <SelectTrigger id="experience">
                  <SelectValue placeholder="Beliebig" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Beliebig</SelectItem>
                  <SelectItem value="entry_level">Einstiegsposition</SelectItem>
                  <SelectItem value="mid_level">Mittlere Erfahrung</SelectItem>
                  <SelectItem value="senior_level">Führungsposition</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Branche (optional)</Label>
              <Input
                id="industry"
                name="industry"
                placeholder="z.B. IT oder Gesundheitswesen"
                value={searchParams.industry}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          {error && (
            <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2 text-sm">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Fehler bei der Suche</p>
                <p className="text-muted-foreground">{error}</p>
                {retryCount > 0 && (
                  <p className="text-muted-foreground mt-1">
                    Versuchen Sie es erneut mit anderen Suchbegriffen oder warten Sie einen Moment.
                  </p>
                )}
              </div>
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={isLoading || !searchParams.query}>
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent border-white" />
                Suche läuft...
              </>
            ) : (
              <>
                <SearchIcon className="mr-2 h-4 w-4" />
                Jobangebote suchen
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default JobSearch;
