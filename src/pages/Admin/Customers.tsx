
// Fix the handleUserRoleRepair function to use the imported toast
const handleUserRoleRepair = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return;
    }
    
    // Force add admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({ user_id: user.id, role: 'admin' }, 
        { onConflict: 'user_id,role' });
        
    if (roleError) {
      console.error('Failed to add admin role:', roleError);
      toast({
        title: "Error",
        description: "Failed to repair admin role. Please try again.",
        variant: "destructive"
      });
    } else {
      // Add admin to company_users
      const { error: companyUserError } = await supabase
        .from('company_users')
        .upsert({ 
          user_id: user.id, 
          company_id: '00000000-0000-0000-0000-000000000000', // dummy ID, will be replaced
          is_admin: true,
          role: 'admin',
          email: user.email
        });
        
      if (companyUserError && !companyUserError.message.includes('violates foreign key constraint')) {
        console.error('Failed to add admin to company_users:', companyUserError);
      }
      
      toast({
        title: "Success",
        description: "Admin role repaired. Refreshing data...",
        variant: "default"
      });
      
      // Refresh all data
      fetchCustomers();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  } catch (error) {
    console.error('Error repairing admin role:', error);
  }
};
