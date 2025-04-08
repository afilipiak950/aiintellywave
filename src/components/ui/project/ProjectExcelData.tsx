
import { useProjectExcel } from '../../../hooks/use-project-excel';
import ProjectExcelHeader from './ProjectExcelHeader';
import ProjectExcelEmpty from './ProjectExcelEmpty';
import LeadsCandidatesTable from './LeadsCandidatesTable';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { subscribeToExcelDataUpdates, unsubscribeFromExcelDataUpdates } from '@/services/leads/lead-realtime';

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
    fetchExcelData,
    uploadFile
  } = useProjectExcel(projectId);
  
  // Handle real-time updates for approval status changes
  useEffect(() => {
    // Setup real-time subscription
    const channel = subscribeToExcelDataUpdates(
      projectId,
      // Handle new rows
      (payload) => {
        console.log('New excel data inserted:', payload);
        fetchExcelData();
      },
      // Handle updates (including approval status changes)
      (payload) => {
        console.log('Excel data updated:', payload);
        fetchExcelData();
      },
      // Handle deletions
      (payload) => {
        console.log('Excel data deleted:', payload);
        fetchExcelData();
      }
    );
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribeFromExcelDataUpdates(channel);
    };
  }, [projectId, fetchExcelData]);
  
  // Handle successful lead import
  const handleLeadsImported = async () => {
    console.log('Leads imported successfully, refreshing Excel data');
    try {
      await fetchExcelData();
      toast({
        title: "Success",
        description: "Excel data successfully imported as leads."
      });
    } catch (error) {
      console.error('Error refreshing data after lead import:', error);
    }
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
