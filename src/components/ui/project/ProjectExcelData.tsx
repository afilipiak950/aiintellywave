
import { useProjectExcel } from '../../../hooks/use-project-excel';
import ProjectExcelHeader from './ProjectExcelHeader';
import ProjectExcelEmpty from './ProjectExcelEmpty';
import ProjectExcelTable from './ProjectExcelTable';

interface ProjectExcelDataProps {
  projectId: string;
  canEdit: boolean;
}

const ProjectExcelData = ({ projectId, canEdit }: ProjectExcelDataProps) => {
  const {
    excelData,
    columns,
    loading,
    uploading,
    searchTerm,
    fileInputRef,
    setSearchTerm,
    handleFileChange,
    handleDeleteAllData,
    exportToExcel,
    updateCellData,
    uploadFile
  } = useProjectExcel(projectId);
  
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
        onUploadClick={uploadFile}
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
          onUploadClick={uploadFile} 
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
