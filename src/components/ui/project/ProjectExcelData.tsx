
import { useProjectExcel } from '../../../hooks/use-project-excel';
import ProjectExcelHeader from './ProjectExcelHeader';
import ProjectExcelEmpty from './ProjectExcelEmpty';
import LeadsCandidatesTable from './LeadsCandidatesTable';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

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
    fetchExcelData, // Make sure this is exposed from the hook
    uploadFile
  } = useProjectExcel(projectId);
  
  // Handle successful lead import
  const handleLeadsImported = () => {
    console.log('Leads imported successfully, refreshing Excel data');
    fetchExcelData(); // Refresh the data display
    toast({
      title: "Success",
      description: "Excel data successfully imported as leads."
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 w-full overflow-hidden">
      <ProjectExcelHeader 
        title="Leads/Candidates Management"
        subtitle={excelData.length > 0 
          ? `${excelData.length} leads/candidates available` 
          : 'No leads/candidates data available for this project'}
        canEdit={canEdit}
        hasData={excelData.length > 0}
        uploading={uploading}
        onUploadClick={uploadFile}
        onExportClick={exportToExcel}
        onDeleteClick={handleDeleteAllData}
        rowCount={excelData.length}
        projectId={projectId}
        onLeadsImported={handleLeadsImported}
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
        <div className="w-full overflow-x-hidden">
          <LeadsCandidatesTable
            data={excelData}
            columns={columns}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            canEdit={canEdit}
            onCellUpdate={updateCellData}
            projectId={projectId}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectExcelData;
