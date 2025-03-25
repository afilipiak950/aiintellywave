
import { useRef, useState } from 'react';
import { useProjectExcelData } from '../../../hooks/use-project-excel-data';
import ProjectExcelHeader from './ProjectExcelHeader';
import ProjectExcelEmpty from './ProjectExcelEmpty';
import ProjectExcelTable from './ProjectExcelTable';

interface ProjectExcelDataProps {
  projectId: string;
  canEdit: boolean;
}

const ProjectExcelData = ({ projectId, canEdit }: ProjectExcelDataProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    excelData,
    columns,
    loading,
    uploading,
    processExcelFile,
    exportToExcel,
    deleteAllData,
    updateCellData
  } = useProjectExcelData(projectId);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }
      
      const file = e.target.files[0];
      await processExcelFile(file);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleDeleteAllData = () => {
    if (!window.confirm('Are you sure you want to delete all Excel data? This action cannot be undone.')) {
      return;
    }
    
    deleteAllData();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <ProjectExcelHeader 
        title="Project Excel Data"
        subtitle={excelData.length > 0 
          ? `${excelData.length} rows of data available` 
          : 'No Excel data available for this project'}
        canEdit={canEdit}
        hasData={excelData.length > 0}
        uploading={uploading}
        onUploadClick={() => fileInputRef.current?.click()}
        onExportClick={exportToExcel}
        onDeleteClick={handleDeleteAllData}
      />
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".xlsx,.xls,.csv"
        id="excel-upload"
      />
      
      {excelData.length === 0 ? (
        <ProjectExcelEmpty 
          canEdit={canEdit} 
          onUploadClick={() => fileInputRef.current?.click()} 
        />
      ) : (
        <ProjectExcelTable 
          data={excelData}
          columns={columns}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          canEdit={canEdit}
          onCellUpdate={updateCellData}
        />
      )}
    </div>
  );
};

export default ProjectExcelData;
