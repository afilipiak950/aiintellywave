
import React from 'react';
import { 
  FileText, Image, FileSpreadsheet, File, FileType, 
  ArrowDownToLine, Trash2 
} from 'lucide-react';
import { Button } from "../../button";
import { Card } from "../../card";
import { Badge } from "../../badge";
import { formatFileSize } from "../../../utils/file-utils";
import { ProjectFile } from '../../../types/project';

interface FileCardProps {
  file: ProjectFile;
  onDownload: (file: ProjectFile) => void;
  onDelete: (fileId: string, filePath: string) => void;
  canEdit: boolean;
}

const FileCard: React.FC<FileCardProps> = ({ file, onDownload, onDelete, canEdit }) => {
  // Determine file icon based on file type
  const getFileIcon = () => {
    if (file.file_type.startsWith('image/')) return Image;
    if (file.file_type.includes('spreadsheet') || file.file_type.includes('excel') || file.file_type.includes('csv')) return FileSpreadsheet;
    if (file.file_type.includes('pdf')) return FileType;
    return FileText;
  };
  
  const FileIcon = getFileIcon();

  return (
    <Card key={file.id} className="p-4 flex">
      <div className="flex-shrink-0 mr-4">
        <div className="w-12 h-12 flex items-center justify-center rounded bg-gray-100">
          <FileIcon className="h-6 w-6 text-gray-500" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-gray-900 truncate" title={file.file_name}>
              {file.file_name}
            </h3>
            <p className="text-xs text-gray-500">
              {formatFileSize(file.file_size)}
            </p>
          </div>
          
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onDownload(file)}
              title="Download"
            >
              <ArrowDownToLine size={16} />
            </Button>
            
            {canEdit && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onDelete(file.id, file.file_path)}
                className="text-red-600 hover:text-red-700"
                title="Delete"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        </div>
        
        <div className="mt-2 flex items-center text-xs text-gray-500">
          <p>
            Uploaded by <span className="font-medium">{file.uploader_name}</span>
          </p>
          <span className="mx-1">•</span>
          <p>{new Date(file.created_at).toLocaleDateString()}</p>
        </div>
        
        <Badge variant="outline" className="mt-2">
          {file.file_type.split('/').pop()?.toUpperCase() || 'FILE'}
        </Badge>
      </div>
    </Card>
  );
};

export default FileCard;
