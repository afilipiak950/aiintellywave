
// Add this function if it doesn't exist, or update it if it does
export const updateApprovalStatus = async (rowId: string, status: string | null) => {
  try {
    console.log(`Updating approval status for row ${rowId} to ${status}`);
    const { data, error } = await supabase
      .from('project_excel_data')
      .update({ approval_status: status })
      .eq('id', rowId)
      .select();
    
    if (error) {
      console.error('Error updating approval status:', error);
      throw error;
    }
    
    console.log('Approval status updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in updateApprovalStatus:', error);
    throw error;
  }
};

export const fetchLeadsWithApprovalStatus = async (projectId: string) => {
  try {
    console.log(`Fetching leads with approval status for project ${projectId}`);
    const { data, error } = await supabase
      .from('project_excel_data')
      .select('id, approval_status')
      .eq('project_id', projectId);
    
    if (error) {
      console.error('Error fetching leads with approval status:', error);
      throw error;
    }
    
    console.log(`Found ${data.length} leads with approval status information`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchLeadsWithApprovalStatus:', error);
    return [];
  }
};
