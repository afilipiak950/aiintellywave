
import { Lead } from '@/types/lead';
import { useState } from 'react';
import { motion } from "framer-motion";
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DetailsTabContentProps {
  lead: Lead;
  expandedFields: Record<string, boolean>;
  toggleExpand: (key: string) => void;
}

const DetailsTabContent = ({ lead, expandedFields, toggleExpand }: DetailsTabContentProps) => {
  // Render expanded/collapsible text
  const renderExpandableText = (text: string, key: string) => {
    if (!text || text.length <= 150) return <p>{text || "N/A"}</p>;
    
    const isExpanded = expandedFields[key];
    
    return (
      <div className="space-y-1">
        <motion.div 
          initial={{ height: "auto" }}
          animate={{ height: "auto" }}
          exit={{ height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          {isExpanded ? (
            <p>{text}</p>
          ) : (
            <p>{text.substring(0, 150)}...</p>
          )}
        </motion.div>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center text-xs p-0 h-auto hover:text-blue-500 transition-colors"
          onClick={() => toggleExpand(key)}
        >
          {isExpanded ? (
            <>Show less <ChevronUp className="ml-1 h-3 w-3" /></>
          ) : (
            <>Read more <ChevronDown className="ml-1 h-3 w-3" /></>
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-base font-semibold mb-3">All Lead Information</h3>
        
        <ScrollArea className="h-[calc(70vh-16rem)] pr-4">
          <div className="grid grid-cols-1 gap-4 bg-white border rounded-lg p-4 shadow-sm">
            {/* Standard fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{lead.name || 'N/A'}</p>
              </div>
              {lead.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{lead.email}</p>
                </div>
              )}
              {lead.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{lead.phone}</p>
                </div>
              )}
              {lead.company && (
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{lead.company}</p>
                </div>
              )}
              {lead.position && (
                <div>
                  <p className="text-sm text-muted-foreground">Position</p>
                  <p className="font-medium">{lead.position}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{lead.status}</p>
              </div>
              {lead.score > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="font-medium">{lead.score}</p>
                </div>
              )}
              {lead.last_contact && (
                <div>
                  <p className="text-sm text-muted-foreground">Last Contact</p>
                  <p className="font-medium">{lead.last_contact}</p>
                </div>
              )}
            </div>
            
            {/* Extra data fields - display absolutely everything */}
            {lead.extra_data && Object.keys(lead.extra_data).length > 0 && (
              <>
                <div className="border-t border-dashed pt-4 mt-2">
                  <h4 className="text-sm font-medium mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                    Additional Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {Object.entries(lead.extra_data).map(([key, value]) => (
                      <div key={key} className="group">
                        <p className="text-sm text-muted-foreground">{key}</p>
                        {typeof value === 'string' && value.length > 150 ? (
                          renderExpandableText(value, key)
                        ) : (
                          <p className="font-medium break-words group-hover:bg-slate-50 p-1 transition-colors rounded">
                            {value?.toString() || 'N/A'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </motion.div>
    </div>
  );
};

export default DetailsTabContent;
