import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Deal {
  id: string;
  title: string;
  client_id?: string;
  amount?: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed' | 'lost';
  probability?: number;
  close_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const useDealsSupabase = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDeals(data || []);
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError(err instanceof Error ? err.message : 'Error fetching deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const addDeal = async (dealData: Omit<Deal, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const user = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('deals')
        .insert([{
          title: dealData.title,
          client_id: dealData.client_id,
          amount: dealData.amount,
          stage: dealData.stage,
          probability: dealData.probability,
          close_date: dealData.close_date,
          notes: dealData.notes,
          created_by: user.data.user?.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      setDeals(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding deal:', err);
      setError(err instanceof Error ? err.message : 'Error adding deal');
      throw err;
    }
  };

  const updateDeal = async (id: string, updates: Partial<Deal>) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('deals')
        .update({
          title: updates.title,
          client_id: updates.client_id,
          amount: updates.amount,
          stage: updates.stage,
          probability: updates.probability,
          close_date: updates.close_date,
          notes: updates.notes
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setDeals(prev => 
        prev.map(deal => deal.id === id ? data : deal)
      );
      return data;
    } catch (err) {
      console.error('Error updating deal:', err);
      setError(err instanceof Error ? err.message : 'Error updating deal');
      throw err;
    }
  };

  const deleteDeal = async (id: string) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setDeals(prev => prev.filter(deal => deal.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting deal:', err);
      setError(err instanceof Error ? err.message : 'Error deleting deal');
      throw err;
    }
  };

  const getDealById = (id: string) => {
    return deals.find(deal => deal.id === id);
  };

  const getDealsByClientId = (clientId: string) => {
    return deals.filter(deal => deal.client_id === clientId);
  };

  return {
    deals,
    loading,
    error,
    addDeal,
    updateDeal,
    deleteDeal,
    getDealById,
    getDealsByClientId,
    refreshDeals: fetchDeals,
  };
};