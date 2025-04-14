import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { SearchString } from '@/hooks/search-strings/use-search-strings';
import { Edit, Check, Copy, FileText, Globe, AlignJustify, Save, Info, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SearchStringDetailDialogProps {
  searchString: SearchString;
  open: boolean;
  onClose: () => void;
  onUpdate?: (id: string, generatedString: string) => Promise<boolean>;
}

const SearchStringDetailDialog: React.FC<SearchStringDetailDialogProps> = ({
  searchString,
  open,
  onClose,
  onUpdate,
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedString, setEditedString] = useState(searchString.generated_string || '');
  const [isSaving, setIsSaving] = useState(false);
  const [analyzedKeywords, setAnalyzedKeywords] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    setEditedString(searchString.generated_string || '');
    if (searchString.generated_string) {
      analyzeSearchString(searchString.generated_string);
    }
  }, [searchString.generated_string]);

  const analyzeSearchString = (searchString: string) => {
    const keywords: string[] = [];
    const quotedTerms = searchString.match(/"([^"]+)"/g) || [];
    quotedTerms.forEach(term => {
      const cleaned = term.replace(/"/g, '');
      if (cleaned && !keywords.includes(cleaned)) {
        keywords.push(cleaned);
      }
    });
    const parenthesesGroups = searchString.match(/\(([^"()]+)\)/g) || [];
    parenthesesGroups.forEach(group => {
      const cleaned = group.replace(/[()]/g, '');
      const terms = cleaned.split(/\s+OR\s+/);
      terms.forEach(term => {
        const trimmed = term.trim();
        if (trimmed && !keywords.includes(trimmed)) {
          keywords.push(trimmed);
        }
      });
    });
    const andGroups = searchString.split(/\s+AND\s+/);
    andGroups.forEach(group => {
      const cleaned = group.replace(/[()]/g, '').replace(/"/g, '');
      const mainConcept = cleaned.split(/\s+OR\s+/)[0]?.trim();
      if (mainConcept && !keywords.includes(mainConcept) && mainConcept.length > 3) {
        keywords.push(mainConcept);
      }
    });
    setAnalyzedKeywords(keywords.slice(0, 15));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(searchString.generated_string || '');
    toast({
      title: 'Copied to clipboard',
      description: 'Search string has been copied to your clipboard',
    });
  };

  const handleSave = async () => {
    if (!onUpdate) return;
    
    setIsSaving(true);
    try {
      const success = await onUpdate(searchString.id, editedString);
      if (success) {
        setIsEditing(false);
        toast({
          title: 'Changes saved',
          description: 'Your search string has been updated successfully',
        });
        analyzeSearchString(editedString);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: 'Error saving changes',
        description: 'An error occurred while saving your changes',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getSourceIcon = () => {
    switch (searchString.input_source) {
      case 'text':
        return <AlignJustify className="h-5 w-5 text-gray-500" />;
      case 'website':
        return <Globe className="h-5 w-5 text-gray-500" />;
      case 'pdf':
        return <FileText className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const formatBooleanString = (str: string) => {
    if (!str) return '';
    
    return str
      .replace(/\bAND\b/g, '<span class="text-blue-600 font-bold">AND</span>')
      .replace(/\bOR\b/g, '<span class="text-green-600 font-bold">OR</span>')
      .replace(/\bNOT\b/g, '<span class="text-red-600 font-bold">NOT</span>')
      .replace(/\(([^)]+)\)/g, '<span class="text-purple-600">(</span>$1<span class="text-purple-600">)</span>')
      .replace(/"([^"]+)"/g, '<span class="text-orange-500">"</span><span class="text-orange-400">$1</span><span class="text-orange-500">"</span>');
  };

  const renderFormattedString = (str: string) => {
    return <div dangerouslySetInnerHTML={{ __html: formatBooleanString(str) }} />;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Search String Details</DialogTitle>
          <DialogDescription>
            Created {formatDistanceToNow(new Date(searchString.created_at), { addSuffix: true })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant={searchString.type === 'recruiting' ? 'default' : 'secondary'}>
              {searchString.type === 'recruiting' ? 'Recruiting' : 'Lead Generation'}
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1">
              {getSourceIcon()}
              <span>
                {searchString.input_source === 'text' ? 'Text Input' : 
                 searchString.input_source === 'website' ? 'Website' : 'PDF Upload'}
              </span>
            </Badge>
            
            <Badge 
              className={
                searchString.status === 'completed' 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : searchString.status === 'processing'
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }
            >
              {searchString.status.charAt(0).toUpperCase() + searchString.status.slice(1)}
            </Badge>
            
            <div className="ml-auto">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={() => setShowExplanation(!showExplanation)}
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Show/hide search string explanation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {showExplanation && (
            <div className="bg-slate-50 border rounded-md p-4 text-sm">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Understanding Boolean Search Strings
              </h3>
              <div className="space-y-3">
                <p>Boolean search strings use operators like <span className="text-blue-600 font-bold">AND</span>, <span className="text-green-600 font-bold">OR</span>, and <span className="text-red-600 font-bold">NOT</span> to create precise searches:</p>
                
                <div className="ml-4 space-y-2">
                  <div>
                    <p className="font-medium">Grouping with Parentheses ()</p>
                    <p className="text-gray-600">Group related terms with parentheses to establish logical boundaries.</p>
                    <p className="font-mono text-xs bg-gray-100 p-1 mt-1">(<span className="text-orange-500">"Java"</span> OR <span className="text-orange-500">"Python"</span> OR <span className="text-orange-500">"C++"</span>)</p>
                  </div>
                  
                  <div>
                    <p className="font-medium"><span className="text-green-600 font-bold">OR</span> Operator</p>
                    <p className="text-gray-600">Use between similar or alternative terms when any match is acceptable.</p>
                    <p className="font-mono text-xs bg-gray-100 p-1 mt-1"><span className="text-orange-500">"Software Engineer"</span> <span className="text-green-600 font-bold">OR</span> <span className="text-orange-500">"Developer"</span> <span className="text-green-600 font-bold">OR</span> <span className="text-orange-500">"Programmer"</span></p>
                  </div>
                  
                  <div>
                    <p className="font-medium"><span className="text-blue-600 font-bold">AND</span> Operator</p>
                    <p className="text-gray-600">Connect different concept groups where all must be present.</p>
                    <p className="font-mono text-xs bg-gray-100 p-1 mt-1">(<span className="text-orange-500">"Software Engineer"</span> <span className="text-green-600 font-bold">OR</span> <span className="text-orange-500">"Developer"</span>) <span className="text-blue-600 font-bold">AND</span> (<span className="text-orange-500">"JavaScript"</span> <span className="text-green-600 font-bold">OR</span> <span className="text-orange-500">"TypeScript"</span>)</p>
                  </div>
                  
                  <div>
                    <p className="font-medium"><span className="text-red-600 font-bold">NOT</span> Operator</p>
                    <p className="text-gray-600">Excludes terms that are irrelevant to your search.</p>
                    <p className="font-mono text-xs bg-gray-100 p-1 mt-1"><span className="text-orange-500">"Software Engineer"</span> <span className="text-red-600 font-bold">NOT</span> <span className="text-orange-500">"Intern"</span></p>
                  </div>
                  
                  <div>
                    <p className="font-medium">Quotes for Exact Phrases</p>
                    <p className="text-gray-600">Use quotes for exact phrase matching.</p>
                    <p className="font-mono text-xs bg-gray-100 p-1 mt-1"><span className="text-orange-500">"Project Manager"</span> (finds this exact phrase)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {analyzedKeywords.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Key Terms</h3>
              <div className="flex flex-wrap gap-1.5">
                {analyzedKeywords.map((keyword, idx) => (
                  <Badge key={idx} variant="outline" className="bg-gray-50">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {searchString.input_source === 'text' && searchString.input_text && (
            <div>
              <h3 className="text-sm font-medium mb-1">Input Text</h3>
              <div className="p-3 bg-gray-50 rounded-md border text-sm max-h-40 overflow-y-auto">
                {searchString.input_text}
              </div>
            </div>
          )}

          {searchString.input_source === 'website' && searchString.input_url && (
            <div>
              <h3 className="text-sm font-medium mb-1">Source URL</h3>
              <div className="p-3 bg-gray-50 rounded-md border text-sm overflow-x-auto">
                <a href={searchString.input_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {searchString.input_url}
                </a>
              </div>
            </div>
          )}

          {searchString.input_source === 'pdf' && searchString.input_pdf_path && (
            <div>
              <h3 className="text-sm font-medium mb-1">Source PDF</h3>
              <div className="p-3 bg-gray-50 rounded-md border text-sm">
                {searchString.input_pdf_path.split('/').pop()}
              </div>
              
              {searchString.input_text && (
                <div className="mt-2">
                  <h3 className="text-sm font-medium mb-1">Extracted PDF Content</h3>
                  <div className="p-3 bg-gray-50 rounded-md border text-sm max-h-40 overflow-y-auto">
                    {searchString.input_text}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium">Generated Search String</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs h-6 px-2"
                  disabled={isSaving}
                >
                  {isEditing ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="text-xs h-6 px-2"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
            </div>

            {isEditing ? (
              <Textarea
                value={editedString}
                onChange={(e) => setEditedString(e.target.value)}
                className="font-mono text-sm"
                rows={6}
                placeholder="Enter your search string here..."
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                {searchString.generated_string ? 
                  renderFormattedString(searchString.generated_string) : 
                  'No search string generated yet.'}
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-md border border-blue-100 text-sm space-y-3">
            <h3 className="font-medium text-blue-800">How to use this search string:</h3>
            
            <ol className="list-decimal pl-5 space-y-2 text-blue-800">
              <li>Copy the search string using the copy button above</li>
              <li>Go to LinkedIn and click on the search box</li>
              <li>Paste the search string into the search box</li>
              <li>Press Enter to execute the search</li>
            </ol>
            
            <div className="pt-2 border-t border-blue-100">
              <h4 className="font-medium text-blue-800 mb-1">Tips for refining your search:</h4>
              <ul className="list-disc pl-5 space-y-1 text-blue-700">
                <li>Add location by appending: <span className="font-mono bg-blue-100 px-1">AND ("Berlin" OR "München")</span></li>
                <li>Filter by experience: <span className="font-mono bg-blue-100 px-1">AND ("Senior" OR "5+ years")</span></li>
                <li>Exclude terms: <span className="font-mono bg-blue-100 px-1">NOT ("Internship" OR "Student")</span></li>
                <li>Include specific technologies: <span className="font-mono bg-blue-100 px-1">AND ("React" OR "Angular")</span></li>
              </ul>
            </div>
          </div>
          
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {isEditing && (
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="flex items-center gap-1"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SearchStringDetailDialog;
