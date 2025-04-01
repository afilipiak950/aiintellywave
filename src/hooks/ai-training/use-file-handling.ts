
import { useToast } from '@/hooks/use-toast';
import { FileContent } from './types';

export function useFileHandling() {
  const { toast } = useToast();

  // Read file content
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error(`Error reading file: ${file.name}`));
      };
      
      if (file.type.includes('pdf')) {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  // Process files for upload
  const processFiles = async (
    selectedFiles: File[],
    setIsUploading: (value: boolean) => void,
    setError: (error: string | null) => void
  ): Promise<FileContent[] | null> => {
    if (selectedFiles.length === 0) return null;
    
    setIsUploading(true);
    const fileContents: FileContent[] = [];
    
    try {
      for (const file of selectedFiles) {
        const content = await readFileContent(file);
        fileContents.push({
          name: file.name,
          content,
          type: file.type
        });
      }
      setIsUploading(false);
      return fileContents;
    } catch (err: any) {
      setIsUploading(false);
      setError(`Error reading files: ${err.message}`);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to process documents: ${err.message}`,
      });
      return null;
    }
  };

  return {
    readFileContent,
    processFiles
  };
}
