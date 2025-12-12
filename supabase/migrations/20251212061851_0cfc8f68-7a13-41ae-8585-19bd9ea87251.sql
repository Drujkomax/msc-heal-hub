-- Add slug column to products table
ALTER TABLE public.products 
ADD COLUMN slug text UNIQUE;

-- Create index for slug lookups
CREATE INDEX idx_products_slug ON public.products(slug);

-- Generate slugs for existing products based on English name
UPDATE public.products 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      COALESCE(name->>'en', name->>'ru', 'product-' || id::text),
      '[^a-zA-Z0-9\s-]', '', 'g'
    ),
    '\s+', '-', 'g'
  )
) || '-' || LEFT(id::text, 8)
WHERE slug IS NULL;