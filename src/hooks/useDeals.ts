import { useState, useEffect } from 'react';
import { Deal } from '@/types/crm';
import { supabase } from '@/integrations/supabase/client';

export const useDeals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error loading deals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const addDeal = async (dealData: Omit<Deal, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .insert([{
          title: dealData.title,
          client_id: dealData.clientId,
          amount: dealData.amount,
          stage: dealData.stage,
          probability: dealData.probability,
          close_date: dealData.closeDate,
          notes: dealData.notes,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      setDeals(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding deal:', error);
      throw error;
    }
  };

  const updateDeal = (id: string, updates: Partial<Deal>) => {
    try {
      const updatedDeal = dealStorage.update(id, updates);
      if (updatedDeal) {
        setDeals(prev => 
          prev.map(deal => deal.id === id ? updatedDeal : deal)
        );
        return updatedDeal;
      }
      return null;
    } catch (error) {
      console.error('Error updating deal:', error);
      throw error;
    }
  };

  const deleteDeal = (id: string) => {
    try {
      const success = dealStorage.delete(id);
      if (success) {
        setDeals(prev => prev.filter(deal => deal.id !== id));
      }
      return success;
    } catch (error) {
      console.error('Error deleting deal:', error);
      throw error;
    }
  };

  const getDealById = (id: string) => {
    return deals.find(deal => deal.id === id);
  };

  const getDealsByClientId = (clientId: string) => {
    return deals.filter(deal => deal.clientId === clientId);
  };

  return {
    deals,
    loading,
    addDeal,
    updateDeal,
    deleteDeal,
    getDealById,
    getDealsByClientId,
    refreshDeals: loadDeals,
  };
};