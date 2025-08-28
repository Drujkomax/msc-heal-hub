-- Update RLS policy to allow directors to manage products
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;

CREATE POLICY "Admins and directors can manage all products" 
ON public.products 
FOR ALL 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'director'::app_role)
);