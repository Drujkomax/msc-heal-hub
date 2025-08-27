import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  last_contact?: string;
  created_by?: string;
}

export const useClientsSupabase = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err instanceof Error ? err.message : 'Error fetching clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const addClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const user = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          company: clientData.company,
          notes: clientData.notes,
          created_by: user.data.user?.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      setClients(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding client:', err);
      setError(err instanceof Error ? err.message : 'Error adding client');
      throw err;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('clients')
        .update({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          company: updates.company,
          notes: updates.notes,
          last_contact: updates.last_contact
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setClients(prev => 
        prev.map(client => client.id === id ? data : client)
      );
      return data;
    } catch (err) {
      console.error('Error updating client:', err);
      setError(err instanceof Error ? err.message : 'Error updating client');
      throw err;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setClients(prev => prev.filter(client => client.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting client:', err);
      setError(err instanceof Error ? err.message : 'Error deleting client');
      throw err;
    }
  };

  const getClientById = (id: string) => {
    return clients.find(client => client.id === id);
  };

  return {
    clients,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    getClientById,
    refreshClients: fetchClients,
  };
};