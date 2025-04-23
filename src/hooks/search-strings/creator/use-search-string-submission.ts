import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth';
import { SearchStringSource, SearchStringStatus, SearchStringType, SearchStringDBStatus } from '../search-string-types';

interface UseSearchStringSubmissionProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useSearchStringSubmission = ({ onSuccess, onError }: UseSearchStringSubmissionProps = {}) => {
  const [status, setStatus] = useState<SearchStringStatus>('idle');
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchString, setSearchString] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const resetState = useCallback(() => {
    setStatus('idle');
    setProgress(null);
    setError(null);
    setSearchString(null);
  }, []);

  const handleSubmitWebsite = useCallback(async (url: string, type: SearchStringType) => {
    if (!user) {
      console.error('No authenticated user');
      setError('No authenticated user.');
      onError?.('No authenticated user.');
      return;
    }

    setStatus('pending');
    setProgress(null);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('search_strings')
        .insert({
          user_id: user.id,
          input_url: url,
          type: type,
          input_source: 'website' as SearchStringSource,
          status: 'new' as SearchStringDBStatus, // Use the DB-compatible status
        })
        .select()

      if (error) {
        console.error("Error submitting website:", error);
        setStatus('failed');
        setError(error.message);
        onError?.(error.message);
        toast({
          title: "Error",
          description: "Failed to submit website. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (!data || data.length === 0) {
        console.error("No data returned after submitting website");
        setStatus('failed');
        setError('No data returned after submitting website');
        onError?.('No data returned after submitting website');
        toast({
          title: "Error",
          description: "Failed to submit website. No data returned.",
          variant: "destructive"
        });
        return;
      }

      console.log('Website submitted successfully, data:', data);
      setStatus('success'); // UI-only status
      setSearchString(data[0].generated_string);
      onSuccess?.();
      toast({
        title: "Success",
        description: "Website submitted successfully.",
      });

    } catch (err: any) {
      console.error("Unexpected error submitting website:", err);
      setStatus('failed');
      setError(err.message || 'An unexpected error occurred');
      onError?.(err.message || 'An unexpected error occurred');
      toast({
        title: "Error",
        description: "Failed to submit website. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, onSuccess, onError, toast]);

  const handleSubmitText = useCallback(async (text: string, type: SearchStringType) => {
    if (!user) {
      console.error('No authenticated user');
      setError('No authenticated user.');
      onError?.('No authenticated user.');
      return;
    }

    setStatus('pending');
    setProgress(null);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('search_strings')
        .insert({
          user_id: user.id,
          input_text: text,
          type: type,
          input_source: 'text' as SearchStringSource,
          status: 'new' as SearchStringDBStatus, // Use the DB-compatible status
        })
        .select()

      if (error) {
        console.error("Error submitting text:", error);
        setStatus('failed');
        setError(error.message);
        onError?.(error.message);
        toast({
          title: "Error",
          description: "Failed to submit text. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (!data || data.length === 0) {
        console.error("No data returned after submitting text");
        setStatus('failed');
        setError('No data returned after submitting text');
        onError?.('No data returned after submitting text');
        toast({
          title: "Error",
          description: "Failed to submit text. No data returned.",
          variant: "destructive"
        });
        return;
      }

      console.log('Text submitted successfully, data:', data);
      setStatus('success'); // UI-only status
      setSearchString(data[0].generated_string);
      onSuccess?.();
      toast({
        title: "Success",
        description: "Text submitted successfully.",
      });

    } catch (err: any) {
      console.error("Unexpected error submitting text:", err);
      setStatus('failed');
      setError(err.message || 'An unexpected error occurred');
      onError?.(err.message || 'An unexpected error occurred');
      toast({
        title: "Error",
        description: "Failed to submit text. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, onSuccess, onError, toast]);

  const handleSubmitPDF = useCallback(async (file: File, type: SearchStringType) => {
    if (!user) {
      console.error('No authenticated user');
      setError('No authenticated user.');
      onError?.('No authenticated user.');
      return;
    }

    setStatus('pending');
    setProgress(0);
    setError(null);

    const fileName = `${user.id}-${Date.now()}-${file.name}`;
    const filePath = `pdfs/${fileName}`;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('search_string_pdfs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("File upload failed:", uploadError);
        setStatus('failed');
        setError("File upload failed: " + uploadError.message);
        onError?.(uploadError.message);
        toast({
          title: "Error",
          description: "File upload failed. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('File uploaded successfully, data:', uploadData);
      setProgress(50);

      const { data: insertData, error: insertError } = await supabase
        .from('search_strings')
        .insert({
          user_id: user.id,
          input_pdf_path: filePath,
          type: type,
          input_source: 'pdf' as SearchStringSource,
          status: 'new' as SearchStringDBStatus, // Use the DB-compatible status
        })
        .select()

      if (insertError) {
        console.error("Error submitting PDF metadata:", insertError);

        // Attempt to delete the uploaded file if metadata submission fails
        const { error: deleteError } = await supabase.storage
          .from('search_string_pdfs')
          .remove([filePath]);

        if (deleteError) {
          console.error("Failed to delete uploaded file after metadata submission failure:", deleteError);
        }

        setStatus('failed');
        setError("Error submitting PDF metadata: " + insertError.message);
        onError?.(insertError.message);
        toast({
          title: "Error",
          description: "Failed to submit PDF metadata. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (!insertData || insertData.length === 0) {
        console.error("No data returned after submitting PDF metadata");
        setStatus('failed');
        setError('No data returned after submitting PDF metadata');
        onError?.('No data returned after submitting PDF metadata');
        toast({
          title: "Error",
          description: "No data returned after submitting PDF metadata.",
          variant: "destructive"
        });
        return;
      }

      console.log('PDF metadata submitted successfully, data:', insertData);
      setStatus('success'); // UI-only status
      setSearchString(insertData[0].generated_string);
      setProgress(100);
      onSuccess?.();
      toast({
        title: "Success",
        description: "PDF submitted successfully.",
      });

    } catch (error: any) {
      console.error("Unexpected error submitting PDF:", error);

      // Attempt to delete the uploaded file if an unexpected error occurs
      const { error: deleteError } = await supabase.storage
        .from('search_string_pdfs')
        .remove([filePath]);

      if (deleteError) {
        console.error("Failed to delete uploaded file after unexpected error:", deleteError);
      }

      setStatus('failed');
      setProgress(0);
      setError("File upload failed: " + error.message);
      onError?.(error.message);
      setTimeout(() => {
        setProgress(0);
        setStatus('failed');
        setError("File upload failed: " + error.message);
        onError?.(error.message);
      }, 100);

      toast({
        title: "Error",
        description: "Failed to submit PDF. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, onSuccess, onError, toast]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
  }, []);

  return {
    status,
    progress,
    error,
    searchString,
    handleSubmitWebsite,
    handleSubmitText,
    handleSubmitPDF,
    resetState,
    handleSubmit
  };
};
