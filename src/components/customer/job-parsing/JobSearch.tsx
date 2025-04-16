
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Building, Loader2, AlertCircle, Clock, Globe, RefreshCw, Info } from 'lucide-react';
import { SearchParams } from '@/hooks/job-parsing/state/useJobSearchState';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface JobSearchProps {
  searchParams: SearchParams;
  onParamChange: (key: keyof SearchParams, value: string) => void;
  onSearch: (e?: React.FormEvent) => void;
  isLoading: boolean;
  error?: string | null;
  retryCount?: number;
}

const JobSearch: React.FC<JobSearchProps> = ({
  searchParams,
  onParamChange,
  onSearch,
  isLoading,
  error,
  retryCount = 0
}) => {
  // Handle form submission to prevent default behavior
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(e);
  };

  // Determine if we've retried multiple times
  const hasMultipleRetries = retryCount > 2;
  
  // Check if error is related to Apify API
  const isApifyError = error && (
    error.includes('Apify API') || 
    error.includes('Actor run did not succeed') || 
    error.includes('Invalid URL') ||
    error.includes('run-failed') ||
    error.includes('nicht verfügbar')
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jobangebote suchen</CardTitle>
        <CardDescription>
          Geben Sie Suchkriterien ein, um relevante Jobangebote über Google Jobs zu finden.
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
                  placeholder="z.B. Projekt Manager, Software Developer"
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
            <Alert variant={isApifyError ? "warning" : "destructive"} className="mb-4">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>
                {isApifyError ? 'Hinweis zur Google Jobs API' : 'Fehler bei der Suche'}
              </AlertTitle>
              <AlertDescription className="mt-2">
                <div className="text-sm">
                  {isApifyError 
                    ? 'Es konnte keine direkte Verbindung zur Google Jobs API hergestellt werden. Es werden realistische, aber möglicherweise nicht aktuelle Jobangebote angezeigt.' 
                    : error}
                </div>
                {hasMultipleRetries && (
                  <div className="mt-2 text-sm">
                    <p>Bitte versuchen Sie folgendes:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Verwenden Sie einfachere Suchbegriffe ohne Sonderzeichen</li>
                      <li>Versuchen Sie eine generischere Suche ohne spezifische Filter</li>
                      <li>Verwenden Sie weniger oder keine Filter</li>
                      <li>Versuchen Sie es ohne Standort oder Branche</li>
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-3">
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
              ) : error ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Erneut versuchen
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
                Wir rufen bis zu 100 Jobangebote für Sie ab. Dies kann einen Moment dauern.
              </div>
            )}
            
            <div className="bg-muted/30 p-3 rounded-md text-xs text-muted-foreground">
              <div className="flex items-center">
                <Info className="h-3 w-3 mr-1" />
                <span className="font-medium">Info zur Suche:</span>
              </div>
              <p className="mt-1">
                Für die besten Ergebnisse verwenden Sie einfache Suchbegriffe ohne Sonderzeichen. 
                Beispiele: "Projektmanager", "Software Entwickler", "Marketing".
              </p>
              <p className="mt-1">
                Die Jobangebote werden basierend auf Ihrer Suche generiert und 
                enthalten realistische Beschreibungen und Informationen zu aktuellen Positionen.
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default JobSearch;
