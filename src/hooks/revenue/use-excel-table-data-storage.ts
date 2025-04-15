
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ExcelTableData {
  id?: string;
  table_name: string;
  row_labels: string[];
  columns: string[];
  data: Record<string, Record<string, string>>;
  created_at?: string;
  updated_at?: string;
}

export const useExcelTableDataStorage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lade Tabellendaten aus der Datenbank
  const loadExcelTableData = useCallback(async (tableName: string = 'revenue'): Promise<ExcelTableData | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('excel_table_data')
        .select('*')
        .eq('table_name', tableName)
        .single();
      
      if (error) {
        // Wenn keine Daten gefunden wurden, geben wir null zurück
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      
      return data as ExcelTableData;
    } catch (err) {
      console.error('Fehler beim Laden der Excel-Tabellendaten:', err);
      setError('Daten konnten nicht geladen werden.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Speichere Tabellendaten in der Datenbank
  const saveExcelTableData = useCallback(async (
    data: ExcelTableData
  ): Promise<ExcelTableData | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Prüfen, ob Daten bereits existieren
      const { data: existingData, error: fetchError } = await supabase
        .from('excel_table_data')
        .select('id')
        .eq('table_name', data.table_name)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      let result;
      
      if (existingData?.id) {
        // Update vorhandene Daten
        const { data: updatedData, error: updateError } = await supabase
          .from('excel_table_data')
          .update({
            row_labels: data.row_labels,
            columns: data.columns,
            data: data.data,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        result = updatedData;
      } else {
        // Neue Daten einfügen
        const { data: newData, error: insertError } = await supabase
          .from('excel_table_data')
          .insert({
            table_name: data.table_name,
            row_labels: data.row_labels,
            columns: data.columns,
            data: data.data
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        result = newData;
      }
      
      return result as ExcelTableData;
    } catch (err) {
      console.error('Fehler beim Speichern der Excel-Tabellendaten:', err);
      setError('Daten konnten nicht gespeichert werden.');
      toast({
        title: 'Fehler',
        description: 'Daten konnten nicht gespeichert werden.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    loadExcelTableData,
    saveExcelTableData
  };
};
