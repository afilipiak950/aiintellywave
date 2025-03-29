
import { Button } from "../../ui/button";
import { FileSpreadsheet, Trash2, UploadCloud } from "lucide-react";
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
  rowCount?: number;
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
  rowCount = 0,
  projectId
}: ProjectExcelHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {canEdit && (
          <Button 
            onClick={onUploadClick}
            disabled={uploading}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <UploadCloud className="h-4 w-4 mr-1" />
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        )}
        
        {hasData && (
          <>
            <Button
              onClick={onExportClick}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              Export
            </Button>
            
            <ProjectExcelImportLeads 
              projectId={projectId}
              excelRowCount={rowCount}
            />
            
            {canEdit && (
              <Button
                onClick={onDeleteClick}
                variant="destructive"
                size="sm"
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete All
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectExcelHeader;
