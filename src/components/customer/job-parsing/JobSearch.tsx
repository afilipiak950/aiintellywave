
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Building, Loader2 } from 'lucide-react';

interface JobSearchParams {
  query: string;
  location?: string;
  experience?: string;
  industry?: string;
}

interface JobSearchProps {
  searchParams: JobSearchParams;
  onParamChange: (key: keyof JobSearchParams, value: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

const JobSearch: React.FC<JobSearchProps> = ({
  searchParams,
  onParamChange,
  onSearch,
  isLoading
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Jobangebote suchen</CardTitle>
        <CardDescription>
          Geben Sie Suchkriterien ein, um relevante Jobangebote zu finden.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              value={searchParams.experience || ''}
              onValueChange={(value) => onParamChange('experience', value)}
            >
              <SelectTrigger id="experience">
                <SelectValue placeholder="Beliebig" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Beliebig</SelectItem>
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
        
        <Button 
          onClick={onSearch} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Suche läuft...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Jobangebote suchen
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobSearch;
