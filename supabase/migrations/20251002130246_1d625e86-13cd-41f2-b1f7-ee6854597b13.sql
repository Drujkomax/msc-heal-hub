-- Add policy for observers to view all products (active, draft, and archived)
-- This allows observers to preview any product in the admin panel

CREATE POLICY "Observers can view all products"
ON public.products
FOR SELECT
USING (
  public.has_role(auth.uid(), 'observer'::app_role)
);