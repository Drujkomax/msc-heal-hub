import { supabase } from '@/integrations/supabase/client';

export const createUserWithRole = async (email: string, password: string, role: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: {
        email,
        password,
        role
      }
    });

    if (error) {
      console.error('Error calling create-user function:', error);
      throw error;
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to create user');
    }

    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};