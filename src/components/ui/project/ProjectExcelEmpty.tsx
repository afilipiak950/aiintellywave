
import { FileSpreadsheet, Upload } from 'lucide-react';
import { Button } from "../button";

interface ProjectExcelEmptyProps {
  canEdit: boolean;
  onUploadClick: () => void;
}

const ProjectExcelEmpty = ({ canEdit, onUploadClick }: ProjectExcelEmptyProps) => {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900">No leads/candidates available</h3>
      <p className="text-gray-500 mt-1">
        {canEdit 
          ? 'Upload an Excel file to add leads and candidates to this project.' 
          : 'No leads or candidates data has been added to this project yet.'}
      </p>
      {canEdit && (
        <Button 
          onClick={onUploadClick}
          className="mt-4"
        >
          <Upload size={16} className="mr-2" />
          Upload Excel File
        </Button>
      )}
    </div>
  );
};

export default ProjectExcelEmpty;
