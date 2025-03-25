
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../integrations/supabase/client';
import { 
  FileText, Image, FileSpreadsheet, File, Upload, Download, 
  Trash2, Search, UploadCloud, ArrowDownToLine, FileType
} from 'lucide-react';
import { toast } from "../../../hooks/use-toast";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Card } from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { ProjectFile } from '../../../types/project';

interface ProjectFilesProps {
  projectId: string;
  canEdit: boolean;
}

const ProjectFiles = ({ projectId, canEdit }: ProjectFilesProps) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    fetchFiles();
  }, [projectId]);
  
  const fetchFiles = async () => {
    try {
      setLoading(true);
      
      // Use raw query since type definitions don't include our tables yet
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
        const formattedFiles: ProjectFile[] = data.map(item => ({
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
      const filePath = `${projectId}/${Date.now()}.${fileExt}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('project_files')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('project_files')
        .getPublicUrl(filePath);
        
      const publicUrl = urlData.publicUrl;
      
      // Save file metadata to database
      const fileData = {
        project_id: projectId,
        file_name: fileName,
        file_path: publicUrl,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: supabase.auth.getUser().then(res => res.data.user?.id),
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
      
      // Get storage path by extracting from the full URL
      const storageFilePath = filePath.split('/').pop() || '';
      
      // Delete from storage if needed
      if (storageFilePath) {
        try {
          await supabase.storage
            .from('project_files')
            .remove([`${projectId}/${storageFilePath}`]);
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
  
  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) return FileSpreadsheet;
    if (fileType.includes('pdf')) return FileType;
    return FileText;
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Filter files based on search term
  const filteredFiles = files.filter(file => 
    file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Project Files</h2>
          <p className="text-gray-500 text-sm">
            {files.length > 0 
              ? `${files.length} files uploaded` 
              : 'No files uploaded for this project'}
          </p>
        </div>
        
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
            >
              <UploadCloud size={16} className="mr-2" />
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </div>
        )}
      </div>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="search"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {files.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No files uploaded</h3>
          <p className="text-gray-500 mt-1">
            {canEdit 
              ? 'Upload files to share with the project team.' 
              : 'No files have been uploaded to this project yet.'}
          </p>
          {canEdit && (
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="mt-4"
            >
              <Upload size={16} className="mr-2" />
              Upload File
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFiles.map(file => {
            const FileIcon = getFileIcon(file.file_type);
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
                        onClick={() => handleDownloadFile(file)}
                        title="Download"
                      >
                        <ArrowDownToLine size={16} />
                      </Button>
                      
                      {canEdit && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteFile(file.id, file.file_path)}
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
          })}
          
          {filteredFiles.length === 0 && (
            <div className="col-span-2 text-center py-8">
              <p className="text-gray-500">No files matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectFiles;
