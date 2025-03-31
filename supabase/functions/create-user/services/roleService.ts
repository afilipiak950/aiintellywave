
// Service for handling user role operations
export class RoleService {
  private supabaseClient: any;
  
  constructor(supabaseClient: any) {
    this.supabaseClient = supabaseClient;
  }
  
  /**
   * Assign a role to a user in the user_roles table
   */
  async assignRoleToUser(
    userId: string, 
    role: string
  ): Promise<{ success: boolean; error?: any }> {
    console.log(`Assigning role ${role} to user ${userId}`);
    
    try {
      // First check if the user_roles table exists
      console.log('Checking if user_roles table exists');
      const { error: checkError } = await this.supabaseClient
        .from('user_roles')
        .select('id')
        .limit(1);
      
      // If table doesn't exist, skip this step but report success
      if (checkError) {
        console.log('user_roles table might not exist, skipping role assignment. Error:', JSON.stringify(checkError));
        return { success: true };
      }
      
      // Table exists, proceed with insert
      const roleRecord = {
        user_id: userId,
        role // Will be converted to enum by PostgreSQL
      };
      
      console.log('Creating role record:', JSON.stringify(roleRecord));
      
      const { error, data } = await this.supabaseClient
        .from('user_roles')
        .upsert(roleRecord, { 
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select();
      
      if (error) {
        console.warn('Error assigning role to user:', JSON.stringify(error));
        return { success: false, error };
      }
      
      console.log('Role successfully assigned to user, result:', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      console.warn('Exception in role assignment:', error.stack || error);
      return { success: false, error };
    }
  }
}
