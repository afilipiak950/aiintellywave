
import { Button } from "@/components/ui/button";
import { Plus, Download, Trash, Upload, ArrowRightLeft } from "lucide-react";
import ProjectExcelImportLeads from './ProjectExcelImportLeads';
import { motion } from "framer-motion";

interface ProjectExcelHeaderProps {
  title: string;
  subtitle: string;
  canEdit: boolean;
  hasData: boolean;
  uploading: boolean;
  onUploadClick: () => void;
  onExportClick: () => void;
  onDeleteClick: () => void;
  rowCount: number;
  projectId: string;
  onLeadsImported?: () => void;
}

const ProjectExcelHeader = ({ 
  title, 
  subtitle, 
  canEdit, 
  hasData,
  uploading,
  onUploadClick,
  onExportClick,
  onDeleteClick,
  rowCount,
  projectId,
  onLeadsImported
}: ProjectExcelHeaderProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b mb-6 relative"
    >
      {/* Background decoration */}
      <div className="absolute -z-10 left-0 right-0 top-0 bottom-0 opacity-5 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-blue-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-24 h-24 bg-indigo-600 rounded-full blur-3xl"></div>
      </div>
      
      <div className="space-y-1">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent"
        >
          {title}
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground"
        >
          {subtitle}
        </motion.p>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex flex-wrap gap-2 items-center"
      >
        {canEdit && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onUploadClick}
            disabled={uploading}
            className="bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300"
          >
            {uploading ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4 text-indigo-600" />
                Upload Excel
              </>
            )}
          </Button>
        )}
        
        {hasData && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExportClick}
              className="bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-300"
            >
              <Download className="mr-2 h-4 w-4 text-emerald-600" />
              Export
            </Button>
            
            {canEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onDeleteClick}
                className="bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 text-red-600 transition-all duration-300"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete All
              </Button>
            )}
            
            {/* Add the import as leads button */}
            {canEdit && rowCount > 0 && (
              <ProjectExcelImportLeads 
                projectId={projectId}
                rowCount={rowCount}
                onSuccess={onLeadsImported}
              />
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProjectExcelHeader;
