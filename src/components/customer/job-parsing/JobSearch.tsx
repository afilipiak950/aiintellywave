
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Building, Loader2, AlertCircle, Clock } from 'lucide-react';
import { SearchParams } from '@/hooks/job-parsing/state/useJobSearchState';

interface JobSearchProps {
  searchParams: SearchParams;
  onParamChange: (key: keyof SearchParams, value: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  error?: string | null;
}

const JobSearch: React.FC<JobSearchProps> = ({
  searchParams,
  onParamChange,
  onSearch,
  isLoading,
  error
}) => {
  // Handle form submission to prevent default behavior
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jobangebote suchen</CardTitle>
        <CardDescription>
          Geben Sie Suchkriterien ein, um relevante Jobangebote zu finden.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="query">Suchbegriff</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="query"
                  placeholder="z.B. Project Manager, Software Developer"
                  value={searchParams.query}
                  onChange={(e) => onParamChange('query', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Standort</Label>
              <div className="relative">
                <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="z.B. Berlin, Remote"
                  value={searchParams.location || ''}
                  onChange={(e) => onParamChange('location', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience">Berufserfahrung</Label>
              <Select
                value={searchParams.experience || "any"}
                onValueChange={(value) => onParamChange('experience', value)}
              >
                <SelectTrigger id="experience">
                  <SelectValue placeholder="Beliebig" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Beliebig</SelectItem>
                  <SelectItem value="entry_level">Einsteiger</SelectItem>
                  <SelectItem value="mid_level">Erfahren</SelectItem>
                  <SelectItem value="senior_level">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Branche</Label>
              <div className="relative">
                <Building className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="industry"
                  placeholder="z.B. Technologie, Finanzen"
                  value={searchParams.industry || ''}
                  onChange={(e) => onParamChange('industry', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-destructive/15 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-destructive mr-2 mt-0.5" />
              <div className="text-sm text-destructive">{error}</div>
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={isLoading || !searchParams.query.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Die Suche kann bis zu 30 Sekunden dauern...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Jobangebote suchen
              </>
            )}
          </Button>
          
          {isLoading && (
            <div className="mt-3 text-xs text-center text-muted-foreground flex items-center justify-center">
              <Clock className="h-3 w-3 mr-1" /> 
              Wir rufen bis zu 50 Jobangebote von Google Jobs für Sie ab. Dies kann einen Moment dauern.
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default JobSearch;
