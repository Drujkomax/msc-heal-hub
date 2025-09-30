import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DealProduct {
  id: string;
  deal_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface DealService {
  id: string;
  deal_id: string;
  service_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export const useDealItems = () => {
  const [dealProducts, setDealProducts] = useState<DealProduct[]>([]);
  const [dealServices, setDealServices] = useState<DealService[]>([]);
  const [loading, setLoading] = useState(false);

  const loadDealProducts = async (dealId?: string) => {
    setLoading(true);
    try {
      let query = supabase.from('deal_products').select('*');
      
      if (dealId) {
        query = query.eq('deal_id', dealId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: true });
      
      if (error) throw error;
      setDealProducts(data || []);
    } catch (error) {
      console.error('Error loading deal products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDealServices = async (dealId?: string) => {
    setLoading(true);
    try {
      let query = supabase.from('deal_services').select('*');
      
      if (dealId) {
        query = query.eq('deal_id', dealId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: true });
      
      if (error) throw error;
      setDealServices(data || []);
    } catch (error) {
      console.error('Error loading deal services:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDealProduct = async (dealProduct: Omit<DealProduct, 'id' | 'created_at' | 'updated_at' | 'total_price'>) => {
    const { data, error } = await supabase
      .from('deal_products')
      .insert([dealProduct])
      .select()
      .single();
    
    if (error) throw error;
    
    setDealProducts(prev => [...prev, data]);
    return data;
  };

  const addDealService = async (dealService: Omit<DealService, 'id' | 'created_at' | 'updated_at' | 'total_price'>) => {
    const { data, error } = await supabase
      .from('deal_services')
      .insert([dealService])
      .select()
      .single();
    
    if (error) throw error;
    
    setDealServices(prev => [...prev, data]);
    return data;
  };

  const updateDealProduct = async (id: string, updates: Partial<DealProduct>) => {
    const { data, error } = await supabase
      .from('deal_products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    setDealProducts(prev => prev.map(item => item.id === id ? data : item));
    return data;
  };

  const updateDealService = async (id: string, updates: Partial<DealService>) => {
    const { data, error } = await supabase
      .from('deal_services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    setDealServices(prev => prev.map(item => item.id === id ? data : item));
    return data;
  };

  const deleteDealProduct = async (id: string) => {
    const { error } = await supabase
      .from('deal_products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    setDealProducts(prev => prev.filter(item => item.id !== id));
  };

  const deleteDealService = async (id: string) => {
    const { error } = await supabase
      .from('deal_services')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    setDealServices(prev => prev.filter(item => item.id !== id));
  };

  const getDealProductsByDealId = (dealId: string) => {
    return dealProducts.filter(product => product.deal_id === dealId);
  };

  const getDealServicesByDealId = (dealId: string) => {
    return dealServices.filter(service => service.deal_id === dealId);
  };

  const calculateDealTotal = (dealId: string) => {
    const products = getDealProductsByDealId(dealId);
    const services = getDealServicesByDealId(dealId);
    
    const productsTotal = products.reduce((sum, product) => sum + product.total_price, 0);
    const servicesTotal = services.reduce((sum, service) => sum + service.total_price, 0);
    
    return productsTotal + servicesTotal;
  };

  return {
    dealProducts,
    dealServices,
    loading,
    loadDealProducts,
    loadDealServices,
    addDealProduct,
    addDealService,
    updateDealProduct,
    updateDealService,
    deleteDealProduct,
    deleteDealService,
    getDealProductsByDealId,
    getDealServicesByDealId,
    calculateDealTotal,
  };
};