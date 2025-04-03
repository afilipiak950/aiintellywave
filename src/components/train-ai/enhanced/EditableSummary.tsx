
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ExternalLink, Edit2, Save, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EditableSummaryProps {
  summary: string;
  url: string;
  jobId: string;
  onSummaryUpdated?: (updatedSummary: string) => void;
}

export const EditableSummary: React.FC<EditableSummaryProps> = ({ 
  summary, 
  url, 
  jobId,
  onSummaryUpdated
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(summary);
  const [isSaving, setIsSaving] = useState(false);
  
  const domain = url ? new URL(url).hostname : '';
  
  // Format summary with highlights for key terms
  const formattedSummary = summary.split('\n').map((paragraph, index) => (
    paragraph ? <p key={index} className="mb-4">{paragraph}</p> : null
  ));
  
  const handleSave = async () => {
    if (!editedSummary.trim()) {
      toast({
        title: "Validation Error",
        description: "Summary cannot be empty",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase.rpc('update_job_summary', {
        p_job_id: jobId,
        p_summary: editedSummary
      });

      if (error) {
        throw error;
      }

      // Notify parent component
      if (onSummaryUpdated) {
        onSummaryUpdated(editedSummary);
      }

      toast({
        title: "Summary Updated",
        description: "Your changes have been saved successfully.",
        variant: "default"
      });

      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating summary:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to save changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedSummary(summary);
    setIsEditing(false);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">AI Summary</h2>
        </div>
        
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1"
          >
            <Edit2 size={16} />
            Edit
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <span>Generated for:</span>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-primary hover:underline"
        >
          {domain} <ExternalLink size={14} />
        </a>
      </div>
      
      {isEditing ? (
        <div className="space-y-4">
          <Textarea
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
            className="w-full min-h-[300px] p-4"
            placeholder="Enter summary text..."
          />
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-1"
            >
              <X size={16} />
              Cancel
            </Button>
            
            <Button
              variant="default"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin mr-1">⟳</span> Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md">
          {formattedSummary}
        </div>
      )}
    </motion.div>
  );
};
