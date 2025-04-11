import { supabase } from '@/integrations/supabase/client';
import { UserData } from '../types/customerTypes';

export const fetchUserData = async (): Promise<UserData[]> => {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }

    // Add user_id to the return type object
    const formattedUserData = userData.map(user => ({
      id: user.id,
      user_id: user.id, // Add user_id field to match the expected type
      email: user.email,
      full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      first_name: user.first_name,
      last_name: user.last_name,
      company_id: user.company_id,
      company_name: user.company_name,
      company_role: user.company_role,
      is_admin: user.is_admin,
      avatar_url: user.avatar_url,
      phone: user.phone,
      position: user.position,
      is_active: user.is_active,
      contact_email: user.contact_email,
      contact_phone: user.contact_phone,
      city: user.city,
      country: user.country
    }));

    return formattedUserData;
  } catch (error: any) {
    console.error('Error in fetchUserData:', error);
    return [];
  }
};
