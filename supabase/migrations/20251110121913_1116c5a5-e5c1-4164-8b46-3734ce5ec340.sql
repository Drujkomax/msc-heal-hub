-- Add minimum_stock field for low stock notifications
ALTER TABLE public.warehouse_items 
ADD COLUMN minimum_stock INTEGER DEFAULT 0,
ADD COLUMN notify_low_stock BOOLEAN DEFAULT false;

-- Create index for low stock queries
CREATE INDEX idx_warehouse_items_low_stock ON public.warehouse_items(quantity, minimum_stock) 
WHERE archived = false AND notify_low_stock = true;

-- Function to get low stock items
CREATE OR REPLACE FUNCTION public.get_low_stock_items()
RETURNS TABLE(
  id UUID,
  name JSONB,
  quantity INTEGER,
  minimum_stock INTEGER,
  location TEXT,
  product_id UUID
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, quantity, minimum_stock, location, product_id
  FROM public.warehouse_items
  WHERE archived = false 
    AND notify_low_stock = true
    AND quantity <= minimum_stock
  ORDER BY quantity ASC;
$$;