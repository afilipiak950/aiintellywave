
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const createInitialUsers = async () => {
  try {
    // Create admin user
    const { data: adminUser, error: adminError } = await supabase.auth.signUp({
      email: 'admin@intellywave.de',
      password: 'admin',
      options: {
        data: {
          role: 'admin'
        }
      }
    });

    if (adminError) throw adminError;

    // Create customer user
    const { data: customerUser, error: customerError } = await supabase.auth.signUp({
      email: 'af@intellywave.de',
      password: 'user',
      options: {
        data: {
          role: 'customer'
        }
      }
    });

    if (customerError) throw customerError;

    // Add roles to user_roles table
    const { error: adminRoleError } = await supabase
      .from('user_roles')
      .insert({ 
        user_id: adminUser.user?.id, 
        role: 'admin' 
      });

    const { error: customerRoleError } = await supabase
      .from('user_roles')
      .insert({ 
        user_id: customerUser.user?.id, 
        role: 'customer' 
      });

    if (adminRoleError) throw adminRoleError;
    if (customerRoleError) throw customerRoleError;

    toast.success('Initial users created successfully');
    return { adminUser, customerUser };
  } catch (error) {
    console.error('Error creating initial users:', error);
    toast.error('Failed to create initial users');
    throw error;
  }
};
