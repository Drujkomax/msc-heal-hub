-- Create manufacturers table
CREATE TABLE public.manufacturers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name JSONB NOT NULL,
  country_code TEXT NOT NULL,
  logo_url TEXT,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;

-- Public can view manufacturers
CREATE POLICY "Manufacturers are publicly viewable"
ON public.manufacturers
FOR SELECT
USING (true);

-- Managers can manage manufacturers
CREATE POLICY "Managers can manage manufacturers"
ON public.manufacturers
FOR ALL
USING (
  has_role(auth.uid(), 'director'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'sales_manager'::app_role)
);

-- Trigger for updated_at
CREATE TRIGGER update_manufacturers_updated_at
BEFORE UPDATE ON public.manufacturers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add manufacturer_id to products table
ALTER TABLE public.products
ADD COLUMN manufacturer_id UUID REFERENCES public.manufacturers(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_products_manufacturer_id ON public.products(manufacturer_id);