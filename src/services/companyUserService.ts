
// This file implements the company user service with proper type definitions

import { UserData } from '@/types/customer';
import { supabase } from '@/integrations/supabase/client';

export const getCompanyUsers = async (companyId?: string) => {
  try {
    if (!companyId) {
      // If no company ID is provided, return an empty array
      console.log('No company ID provided to getCompanyUsers');
      return [];
    }
    
    // Fetch users for the specified company
    const { data, error } = await supabase
      .from('company_users')
      .select('*')
      .eq('company_id', companyId);
      
    if (error) {
      console.error('Error fetching company users:', error);
      throw error;
    }
    
    return data as UserData[];
  } catch (error) {
    console.error('Error in getCompanyUsers:', error);
    return [];
  }
};

export const updateCompanyUser = async (userId: string, data: any) => {
  try {
    const { data: updateData, error } = await supabase
      .from('company_users')
      .update(data)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating company user:', error);
      throw error;
    }
    
    return updateData;
  } catch (error) {
    console.error('Error in updateCompanyUser:', error);
    throw error;
  }
};

export const deleteCompanyUser = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('company_users')
      .delete()
      .eq('id', userId);
      
    if (error) {
      console.error('Error deleting company user:', error);
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in deleteCompanyUser:', error);
    throw error;
  }
};
