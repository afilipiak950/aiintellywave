
import React from 'react';
import { Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface BooleanSearchExplainerProps {
  compact?: boolean;
  className?: string;
}

export const BooleanSearchExplainer: React.FC<BooleanSearchExplainerProps> = ({ 
  compact = false,
  className = '' 
}) => {
  return (
    <Card className={`${className}`}>
      <CardContent className={`${compact ? 'p-3' : 'p-4'} space-y-3`}>
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <Info className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-blue-500`} />
          Boolean Search Syntax
        </h3>
        
        {!compact && (
          <p className="text-sm text-gray-700">
            Boolean search strings combine terms with operators to create powerful, precise searches.
            Learn how to structure your searches effectively:
          </p>
        )}
        
        <div className={`space-y-${compact ? '2' : '3'} text-sm`}>
          <div>
            <p className="font-medium">Grouping with Parentheses ()</p>
            <p className="text-gray-600 text-xs">Group related terms for logical boundaries</p>
            <code className="font-mono text-xs bg-gray-100 p-1 mt-1 block">
              (<span className="text-orange-500">"Java"</span> OR <span className="text-orange-500">"Python"</span> OR <span className="text-orange-500">"C++"</span>)
            </code>
          </div>
          
          <div>
            <p className="font-medium"><span className="text-green-600 font-bold">OR</span> Operator</p>
            <p className="text-gray-600 text-xs">For alternative terms when any match is acceptable</p>
            <code className="font-mono text-xs bg-gray-100 p-1 mt-1 block">
              <span className="text-orange-500">"Software Engineer"</span> <span className="text-green-600 font-bold">OR</span> <span className="text-orange-500">"Developer"</span>
            </code>
          </div>
          
          <div>
            <p className="font-medium"><span className="text-blue-600 font-bold">AND</span> Operator</p>
            <p className="text-gray-600 text-xs">All terms/groups connected by AND must be present</p>
            <code className="font-mono text-xs bg-gray-100 p-1 mt-1 block">
              (<span className="text-orange-500">"JavaScript"</span>) <span className="text-blue-600 font-bold">AND</span> (<span className="text-orange-500">"5+ years"</span>)
            </code>
          </div>
          
          {!compact && (
            <>
              <div>
                <p className="font-medium"><span className="text-red-600 font-bold">NOT</span> Operator</p>
                <p className="text-gray-600 text-xs">Excludes terms that are irrelevant</p>
                <code className="font-mono text-xs bg-gray-100 p-1 mt-1 block">
                  <span className="text-orange-500">"Project Manager"</span> <span className="text-red-600 font-bold">NOT</span> <span className="text-orange-500">"Intern"</span>
                </code>
              </div>
              
              <div>
                <p className="font-medium">German Example</p>
                <code className="font-mono text-xs bg-gray-100 p-1 mt-1 block">
                  (<span className="text-orange-500">"Finanzbuchalter"</span> <span className="text-green-600 font-bold">OR</span> <span className="text-orange-500">"Buchhalter"</span>) <span className="text-blue-600 font-bold">AND</span> (<span className="text-orange-500">"Berlin"</span> <span className="text-green-600 font-bold">OR</span> <span className="text-orange-500">"30km"</span>) <span className="text-blue-600 font-bold">AND</span> (<span className="text-orange-500">"10j"</span> <span className="text-green-600 font-bold">OR</span> <span className="text-orange-500">"Erfahrung"</span>)
                </code>
              </div>
              
              <div>
                <p className="font-medium">Complex Example</p>
                <code className="font-mono text-xs bg-gray-100 p-1 mt-1 block">
                  (<span className="text-orange-500">"React"</span> <span className="text-green-600 font-bold">OR</span> <span className="text-orange-500">"Angular"</span>) <span className="text-blue-600 font-bold">AND</span> (<span className="text-orange-500">"Frontend"</span> <span className="text-green-600 font-bold">OR</span> <span className="text-orange-500">"UI"</span>) <span className="text-blue-600 font-bold">AND</span> <span className="text-orange-500">"5+ years"</span> <span className="text-red-600 font-bold">NOT</span> <span className="text-orange-500">"Intern"</span>
                </code>
              </div>
            </>
          )}
        </div>
        
        {!compact && (
          <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
            <p className="font-semibold">Pro Tips:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Use AND between different concept groups, and OR between related terms within parentheses</li>
              <li>Every important word from your input will be included in the search string</li>
              <li>For a thorough search, include alternative terms and synonyms in OR groups</li>
              <li>Use quotes around specific terms and phrases for exact matching</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BooleanSearchExplainer;
