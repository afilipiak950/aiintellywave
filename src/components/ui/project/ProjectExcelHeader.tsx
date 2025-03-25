
import { FileSpreadsheet, Download, Trash2 } from 'lucide-react';
import { Button } from "../button";

interface ProjectExcelHeaderProps {
  title: string;
  subtitle: string;
  canEdit: boolean;
  hasData: boolean;
  uploading: boolean;
  onUploadClick: () => void;
  onExportClick: () => void;
  onDeleteClick: () => void;
}

const ProjectExcelHeader = ({
  title,
  subtitle,
  canEdit,
  hasData,
  uploading,
  onUploadClick,
  onExportClick,
  onDeleteClick
}: ProjectExcelHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {canEdit && (
          <Button 
            onClick={onUploadClick}
            disabled={uploading}
            variant="outline"
          >
            <FileSpreadsheet size={16} className="mr-2" />
            {uploading ? 'Processing...' : 'Upload Excel'}
          </Button>
        )}
        
        {hasData && canEdit && (
          <Button 
            variant="destructive"
            onClick={onDeleteClick}
          >
            <Trash2 size={16} className="mr-2" />
            Delete All
          </Button>
        )}
        
        {hasData && (
          <Button 
            variant="outline"
            onClick={onExportClick}
          >
            <Download size={16} className="mr-2" />
            Export
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProjectExcelHeader;
