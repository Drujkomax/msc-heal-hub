-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Create storage policies for product images
CREATE POLICY "Product images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update product images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete product images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Update products table to store multiple images
ALTER TABLE products 
DROP COLUMN image,
ADD COLUMN images JSONB DEFAULT '{"cover": null, "gallery": []}'::jsonb;

-- Add constraint to ensure images structure
ALTER TABLE products 
ADD CONSTRAINT images_structure_check 
CHECK (
  images ? 'cover' AND 
  images ? 'gallery' AND 
  jsonb_typeof(images->'gallery') = 'array'
);