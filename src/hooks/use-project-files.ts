
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from "./use-toast";
import { ProjectFile } from '../types/project';

export const useProjectFiles = (projectId: string) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('project_files')
        .select(`
          *,
          uploader:uploaded_by(
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        // Convert to our ProjectFile type
        const formattedFiles: ProjectFile[] = data.map((item: any) => ({
          id: item.id,
          file_name: item.file_name,
          file_type: item.file_type,
          file_size: item.file_size,
          file_path: item.file_path,
          uploaded_by: item.uploaded_by,
          project_id: item.project_id,
          created_at: item.created_at,
          uploader_name: item.uploader ? 
            `${item.uploader.first_name || ''} ${item.uploader.last_name || ''}`.trim() || 'Unnamed User' : 
            'Unknown User'
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
      const fileName = file.name;
      const filePath = `${projectId}/${Date.now()}_${fileName}`;
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project_files')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('project_files')
        .getPublicUrl(filePath);
        
      const publicUrl = urlData.publicUrl;
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      // Save file metadata to database
      const fileData = {
        project_id: projectId,
        file_name: fileName,
        file_path: publicUrl,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user.id,
        created_at: new Date().toISOString()
      };
      
      // Insert file metadata
      const { error: dbError } = await supabase
        .from('project_files')
        .insert(fileData);
        
      if (dbError) throw dbError;
      
      // Refresh files list
      fetchFiles();
      
      toast({
        title: "Success",
        description: "File uploaded successfully.",
      });
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
  
  const handleDownloadFile = (file: ProjectFile) => {
    try {
      // Create an anchor element and click it to download the file
      const link = document.createElement('a');
      link.href = file.file_path;
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteFile = async (fileId: string, filePath: string) => {
    if (!window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('project_files')
        .delete()
        .eq('id', fileId);
        
      if (dbError) throw dbError;
      
      // Extract storage path from the full URL
      const storagePathMatch = filePath.match(/project_files\/(.+)$/);
      const storagePath = storagePathMatch ? storagePathMatch[1] : null;
      
      // Delete from storage if path was extracted
      if (storagePath) {
        try {
          await supabase.storage
            .from('project_files')
            .remove([storagePath]);
        } catch (storageError) {
          console.warn('Storage deletion error:', storageError);
          // Continue even if storage deletion fails
        }
      }
      
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

  const uploadFile = () => {
    fileInputRef.current?.click();
  };

  const filteredFiles = files.filter(file => 
    file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  return {
    files,
    filteredFiles,
    loading,
    uploading,
    searchTerm,
    fileInputRef,
    setSearchTerm,
    handleFileChange,
    handleDownloadFile,
    handleDeleteFile,
    uploadFile
  };
};
