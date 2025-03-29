
import { Button } from "../button";
import { FileSpreadsheet, Download, Upload, Trash2 } from "lucide-react";
import ProjectExcelImportLeads from "./ProjectExcelImportLeads";

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
  projectId
}: ProjectExcelHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
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
                <Upload className="h-4 w-4 mr-2" />
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
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            {canEdit && (
              <>
                <ProjectExcelImportLeads 
                  projectId={projectId} 
                  rowCount={rowCount}
                />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDeleteClick}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectExcelHeader;
