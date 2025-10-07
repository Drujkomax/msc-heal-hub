-- Add manufacturer name and icon to products table
ALTER TABLE public.products 
ADD COLUMN manufacturer_name text,
ADD COLUMN icon_url text;