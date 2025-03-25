
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../integrations/supabase/client';
import { FileUp, File, Download, Trash2, FileText, Image, FileSpreadsheet, FilePdf, AlertCircle } from 'lucide-react';
import { toast } from "../../../hooks/use-toast";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { useAuth } from '../../../context/AuthContext';

interface ProjectFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  uploaded_by: string;
  uploaded_by_name?: string;
  created_at: string;
}

interface ProjectFilesProps {
  projectId: string;
  canEdit: boolean;
}

const ProjectFiles = ({ projectId, canEdit }: ProjectFilesProps) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    fetchFiles();
  }, [projectId]);
  
  const fetchFiles = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('project_files')
        .select(`
          *,
          uploader:uploaded_by(
            first_name,
            last_name
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        const formattedFiles = data.map(file => ({
          id: file.id,
          file_name: file.file_name,
          file_type: file.file_type,
          file_size: file.file_size,
          file_path: file.file_path,
          uploaded_by: file.uploaded_by,
          uploaded_by_name: file.uploader ? 
            `${file.uploader.first_name || ''} ${file.uploader.last_name || ''}`.trim() || 'Unnamed User' : 
            undefined,
          created_at: file.created_at,
        }));
        
        setFiles(formattedFiles);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: "Failed to load files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }
      
      setUploading(true);
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${projectId}/${fileName}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('project_files')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('project_files')
        .getPublicUrl(filePath);
        
      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }
      
      // Save file metadata to database
      const { data: fileData, error: fileError } = await supabase
        .from('project_files')
        .insert({
          project_id: projectId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_path: filePath,
          uploaded_by: user?.id,
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          uploader:uploaded_by(
            first_name,
            last_name
          )
        `)
        .single();
        
      if (fileError) throw fileError;
      
      if (fileData) {
        const newFile = {
          id: fileData.id,
          file_name: fileData.file_name,
          file_type: fileData.file_type,
          file_size: fileData.file_size,
          file_path: fileData.file_path,
          uploaded_by: fileData.uploaded_by,
          uploaded_by_name: fileData.uploader ? 
            `${fileData.uploader.first_name || ''} ${fileData.uploader.last_name || ''}`.trim() || 'Unnamed User' : 
            undefined,
          created_at: fileData.created_at,
        };
        
        setFiles([newFile, ...files]);
        
        toast({
          title: "Success",
          description: "File uploaded successfully.",
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleDeleteFile = async (fileId: string, filePath: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }
    
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('project_files')
        .remove([filePath]);
        
      if (storageError) throw storageError;
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('project_files')
        .delete()
        .eq('id', fileId);
        
      if (dbError) throw dbError;
      
      // Update local state
      setFiles(files.filter(file => file.id !== fileId));
      
      toast({
        title: "Success",
        description: "File deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: "Failed to delete file. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDownloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('project_files')
        .download(filePath);
        
      if (error) throw error;
      
      if (data) {
        // Create a download link
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
        link.remove();
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.includes('pdf')) return FilePdf;
    if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) return FileSpreadsheet;
    return FileText;
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
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
      {canEdit && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full sm:w-auto"
          >
            <FileUp size={16} className="mr-2" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>
      )}
      
      {files.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No files uploaded</h3>
          <p className="text-gray-500 mt-1">
            {canEdit 
              ? 'Start by uploading project-related files.' 
              : 'No files have been uploaded to this project yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map(file => {
            const FileIcon = getFileIcon(file.file_type);
            
            return (
              <Card key={file.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <FileIcon size={20} />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-900">{file.file_name}</h3>
                      <div className="flex text-xs text-gray-500 mt-1">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span className="mx-2">•</span>
                        <span>Uploaded {new Date(file.created_at).toLocaleDateString()}</span>
                        {file.uploaded_by_name && (
                          <>
                            <span className="mx-2">•</span>
                            <span>By {file.uploaded_by_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadFile(file.file_path, file.file_name)}
                    >
                      <Download size={16} />
                    </Button>
                    
                    {canEdit && (
                      <Button 
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
                        onClick={() => handleDeleteFile(file.id, file.file_path)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectFiles;
