-- Create warehouse_items table for stock management
CREATE TABLE public.warehouse_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name JSONB NOT NULL DEFAULT '{"ru": "", "en": "", "uz": ""}'::jsonb,
  description JSONB DEFAULT '{"ru": "", "en": "", "uz": ""}'::jsonb,
  images JSONB DEFAULT '{"cover": null, "gallery": []}'::jsonb,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'шт',
  location TEXT,
  condition TEXT NOT NULL DEFAULT 'new',
  purchase_price NUMERIC(12,2),
  selling_price NUMERIC(12,2),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMP WITH TIME ZONE,
  archived_by UUID REFERENCES auth.users(id)
);

-- Create index for faster queries
CREATE INDEX idx_warehouse_items_product_id ON public.warehouse_items(product_id);
CREATE INDEX idx_warehouse_items_archived ON public.warehouse_items(archived);
CREATE INDEX idx_warehouse_items_created_by ON public.warehouse_items(created_by);

-- Enable RLS
ALTER TABLE public.warehouse_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for warehouse_items
CREATE POLICY "Managers can manage all warehouse items"
ON public.warehouse_items
FOR ALL
USING (
  has_role(auth.uid(), 'director'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'sales_manager'::app_role)
);

CREATE POLICY "Employees can view warehouse items"
ON public.warehouse_items
FOR SELECT
USING (
  has_role_level(auth.uid(), 'salesperson'::app_role) OR
  has_role(auth.uid(), 'accountant'::app_role) OR
  has_role(auth.uid(), 'engineer'::app_role)
);

CREATE POLICY "Engineers can update stock quantities"
ON public.warehouse_items
FOR UPDATE
USING (
  has_role(auth.uid(), 'engineer'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'engineer'::app_role)
);

-- Trigger to update updated_at
CREATE TRIGGER update_warehouse_items_updated_at
BEFORE UPDATE ON public.warehouse_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to archive warehouse item
CREATE OR REPLACE FUNCTION public.archive_warehouse_item(item_id UUID, user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (has_role(user_id, 'director') OR has_role(user_id, 'admin') OR has_role(user_id, 'sales_manager')) THEN
    RAISE EXCEPTION 'У вас нет прав для архивирования складских товаров';
  END IF;

  UPDATE public.warehouse_items 
  SET 
    archived = true,
    archived_at = now(),
    archived_by = user_id,
    updated_at = now()
  WHERE id = item_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Товар не найден или уже архивирован';
  END IF;
END;
$$;

-- Function to unarchive warehouse item
CREATE OR REPLACE FUNCTION public.unarchive_warehouse_item(item_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.warehouse_items 
  SET 
    archived = false,
    archived_at = null,
    archived_by = null,
    updated_at = now()
  WHERE id = item_id;
END;
$$;