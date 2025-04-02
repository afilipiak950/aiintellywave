
import { Button } from "@/components/ui/button";
import { Plus, Download, Trash, Upload, ArrowRightLeft } from "lucide-react";
import ProjectExcelImportLeads from './ProjectExcelImportLeads';

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
  onLeadsImported?: () => void; // Add callback for lead import success
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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>
      
      <div className="flex flex-wrap gap-2 items-center">
        {canEdit && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onUploadClick}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
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
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            
            {canEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onDeleteClick}
                className="bg-red-50 hover:bg-red-100 text-red-600"
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
      </div>
    </div>
  );
};

export default ProjectExcelHeader;
