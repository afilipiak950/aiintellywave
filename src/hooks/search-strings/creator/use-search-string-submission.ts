
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

  // Simplified text submission
  const handleSubmitText = useCallback(async (text: string, type: SearchStringType) => {
    if (!user) {
      console.error('No authenticated user');
      setError('No authenticated user.');
      onError?.('No authenticated user.');
      return;
    }

    if (!text.trim()) {
      toast({
        title: "Fehler",
        description: "Der Text darf nicht leer sein.",
        variant: "destructive"
      });
      return;
    }

    setStatus('pending');
    setError(null);

    try {
      // Create the search string record
      const { data, error: insertError } = await supabase
        .from('search_strings')
        .insert({
          user_id: user.id,
          input_text: text,
          type: type,
          input_source: 'text' as SearchStringSource,
          status: 'new' as SearchStringDBStatus,
        })
        .select();

      if (insertError) {
        console.error("Error submitting text:", insertError);
        setStatus('failed');
        setError(insertError.message);
        onError?.(insertError.message);
        toast({
          title: "Fehler",
          description: "Text konnte nicht übermittelt werden. Bitte versuchen Sie es erneut.",
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
          title: "Fehler",
          description: "Keine Daten nach der Textübermittlung zurückgegeben.",
          variant: "destructive"
        });
        return;
      }

      console.log('Text submitted successfully, data:', data);
      setStatus('success');
      setSearchString(data[0].generated_string);
      onSuccess?.();
      toast({
        title: "Erfolg",
        description: "Text wurde erfolgreich übermittelt.",
      });

    } catch (err: any) {
      console.error("Unexpected error submitting text:", err);
      setStatus('failed');
      setError(err.message || 'An unexpected error occurred');
      onError?.(err.message || 'An unexpected error occurred');
      toast({
        title: "Fehler",
        description: "Text konnte nicht übermittelt werden. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    }
  }, [user, onSuccess, onError, toast]);

  // Simplified website submission
  const handleSubmitWebsite = useCallback(async (url: string, type: SearchStringType) => {
    if (!user) {
      console.error('No authenticated user');
      setError('No authenticated user.');
      onError?.('No authenticated user.');
      return;
    }

    if (!url.trim()) {
      toast({
        title: "Fehler",
        description: "Die URL darf nicht leer sein.",
        variant: "destructive"
      });
      return;
    }

    setStatus('pending');
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('search_strings')
        .insert({
          user_id: user.id,
          input_url: url,
          type: type,
          input_source: 'website' as SearchStringSource,
          status: 'new' as SearchStringDBStatus,
        })
        .select();

      if (insertError) {
        console.error("Error submitting website:", insertError);
        setStatus('failed');
        setError(insertError.message);
        onError?.(insertError.message);
        toast({
          title: "Fehler",
          description: "Website konnte nicht übermittelt werden. Bitte versuchen Sie es erneut.",
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
          title: "Fehler",
          description: "Keine Daten nach der Website-Übermittlung zurückgegeben.",
          variant: "destructive"
        });
        return;
      }

      console.log('Website submitted successfully, data:', data);
      setStatus('success');
      setSearchString(data[0].generated_string);
      onSuccess?.();
      toast({
        title: "Erfolg",
        description: "Website wurde erfolgreich übermittelt.",
      });

    } catch (err: any) {
      console.error("Unexpected error submitting website:", err);
      setStatus('failed');
      setError(err.message || 'An unexpected error occurred');
      onError?.(err.message || 'An unexpected error occurred');
      toast({
        title: "Fehler",
        description: "Website konnte nicht übermittelt werden. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    }
  }, [user, onSuccess, onError, toast]);

  // Simplified handle PDF
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
          title: "Fehler",
          description: "Datei-Upload fehlgeschlagen. Bitte versuchen Sie es erneut.",
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
          status: 'new' as SearchStringDBStatus,
        })
        .select();

      if (insertError) {
        console.error("Error submitting PDF metadata:", insertError);
        setStatus('failed');
        setError("Error submitting PDF metadata: " + insertError.message);
        onError?.(insertError.message);
        toast({
          title: "Fehler",
          description: "PDF-Metadaten konnten nicht übermittelt werden. Bitte versuchen Sie es erneut.",
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
          title: "Fehler",
          description: "Keine Daten nach der PDF-Metadaten-Übermittlung zurückgegeben.",
          variant: "destructive"
        });
        return;
      }

      console.log('PDF metadata submitted successfully, data:', insertData);
      setStatus('success');
      setSearchString(insertData[0].generated_string);
      setProgress(100);
      onSuccess?.();
      toast({
        title: "Erfolg",
        description: "PDF wurde erfolgreich übermittelt.",
      });

    } catch (error: any) {
      console.error("Unexpected error submitting PDF:", error);
      setStatus('failed');
      setProgress(0);
      setError("File upload failed: " + error.message);
      onError?.(error.message);
      toast({
        title: "Fehler",
        description: "PDF konnte nicht übermittelt werden. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    }
  }, [user, onSuccess, onError, toast]);

  // Simplified form submit handler
  const handleSubmit = useCallback((e: React.FormEvent, type: SearchStringType, inputSource: SearchStringSource, inputText: string, inputUrl: string, selectedFile: File | null) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Fehler",
        description: "Sie müssen angemeldet sein, um diese Funktion zu nutzen.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (inputSource === 'text' && inputText) {
        handleSubmitText(inputText, type);
      } else if (inputSource === 'website' && inputUrl) {
        handleSubmitWebsite(inputUrl, type);
      } else if (inputSource === 'pdf' && selectedFile) {
        handleSubmitPDF(selectedFile, type);
      } else {
        setIsSubmitting(false);
        toast({
          title: "Fehler",
          description: "Bitte geben Sie gültige Eingabedaten für den ausgewählten Quelltyp an.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error("Error in submit handler:", error);
    }
  }, [handleSubmitText, handleSubmitWebsite, handleSubmitPDF, user, toast]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  return {
    status,
    progress,
    error,
    searchString,
    handleSubmitWebsite,
    handleSubmitText,
    handleSubmitPDF,
    resetState,
    handleSubmit,
    isSubmitting,
    setIsSubmitting
  };
};
