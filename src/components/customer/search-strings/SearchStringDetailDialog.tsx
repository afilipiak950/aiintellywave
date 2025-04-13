
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
import { Edit, Check, Copy, FileText, Globe, AlignJustify, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

  // Update editedString when searchString changes
  useEffect(() => {
    setEditedString(searchString.generated_string || '');
    // Extract keywords from the search string for analysis
    if (searchString.generated_string) {
      analyzeSearchString(searchString.generated_string);
    }
  }, [searchString.generated_string]);

  const analyzeSearchString = (searchString: string) => {
    // Extract important keywords from the search string
    // Look for quoted terms and terms within parentheses
    const keywords: string[] = [];
    
    // Extract quoted terms
    const quotedTerms = searchString.match(/"([^"]+)"/g) || [];
    quotedTerms.forEach(term => {
      // Remove quotes and add to keywords if not already present
      const cleaned = term.replace(/"/g, '');
      if (cleaned && !keywords.includes(cleaned)) {
        keywords.push(cleaned);
      }
    });
    
    // Extract terms within parentheses (but not quoted)
    const parenthesesGroups = searchString.match(/\(([^"()]+)\)/g) || [];
    parenthesesGroups.forEach(group => {
      // Remove parentheses
      const cleaned = group.replace(/[()]/g, '');
      // Split by OR and add individual terms
      const terms = cleaned.split(/\s+OR\s+/);
      terms.forEach(term => {
        const trimmed = term.trim();
        if (trimmed && !keywords.includes(trimmed)) {
          keywords.push(trimmed);
        }
      });
    });
    
    // Limit to top 10 keywords
    setAnalyzedKeywords(keywords.slice(0, 10));
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
        // Re-analyze the updated string
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
    // Add syntax highlighting for Boolean operators
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
      <DialogContent className="max-w-2xl">
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
          </div>

          {/* Key Terms Analysis */}
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

          {/* Instructions for using the search string */}
          <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-sm text-blue-800">
            <h3 className="font-medium mb-1">How to use this search string:</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Copy the search string using the copy button above</li>
              <li>Go to LinkedIn and click on the search box</li>
              <li>Paste the search string into the search box</li>
              <li>Press Enter to execute the search</li>
            </ol>
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
