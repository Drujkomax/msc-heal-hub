-- Создание таблиц для связи сделок с несколькими товарами и услугами

-- Таблица для связи сделок с товарами
CREATE TABLE public.deal_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * COALESCE(unit_price, 0)) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(deal_id, product_id)
);

-- Таблица для связи сделок с услугами
CREATE TABLE public.deal_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * COALESCE(unit_price, 0)) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(deal_id, service_id)
);

-- Включаем RLS для таблиц
ALTER TABLE public.deal_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_services ENABLE ROW LEVEL SECURITY;

-- Политики RLS для deal_products
CREATE POLICY "Users can view deal products" 
ON public.deal_products 
FOR SELECT 
USING (has_role_level(auth.uid(), 'salesperson'::app_role) OR has_role(auth.uid(), 'accountant'::app_role));

CREATE POLICY "Users can create deal products" 
ON public.deal_products 
FOR INSERT 
WITH CHECK (has_role_level(auth.uid(), 'salesperson'::app_role));

CREATE POLICY "Users can update deal products" 
ON public.deal_products 
FOR UPDATE 
USING (has_role_level(auth.uid(), 'salesperson'::app_role));

CREATE POLICY "Admins can delete deal products" 
ON public.deal_products 
FOR DELETE 
USING (has_role_level(auth.uid(), 'admin'::app_role));

-- Политики RLS для deal_services
CREATE POLICY "Users can view deal services" 
ON public.deal_services 
FOR SELECT 
USING (has_role_level(auth.uid(), 'salesperson'::app_role) OR has_role(auth.uid(), 'accountant'::app_role));

CREATE POLICY "Users can create deal services" 
ON public.deal_services 
FOR INSERT 
WITH CHECK (has_role_level(auth.uid(), 'salesperson'::app_role));

CREATE POLICY "Users can update deal services" 
ON public.deal_services 
FOR UPDATE 
USING (has_role_level(auth.uid(), 'salesperson'::app_role));

CREATE POLICY "Admins can delete deal services" 
ON public.deal_services 
FOR DELETE 
USING (has_role_level(auth.uid(), 'admin'::app_role));

-- Триггеры для обновления updated_at
CREATE TRIGGER update_deal_products_updated_at
  BEFORE UPDATE ON public.deal_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deal_services_updated_at
  BEFORE UPDATE ON public.deal_services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Индексы для лучшей производительности
CREATE INDEX idx_deal_products_deal_id ON public.deal_products(deal_id);
CREATE INDEX idx_deal_products_product_id ON public.deal_products(product_id);
CREATE INDEX idx_deal_services_deal_id ON public.deal_services(deal_id);
CREATE INDEX idx_deal_services_service_id ON public.deal_services(service_id);