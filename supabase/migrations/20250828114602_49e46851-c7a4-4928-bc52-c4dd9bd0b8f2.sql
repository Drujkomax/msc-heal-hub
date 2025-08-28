-- Fix RLS policies for proper role-based access

-- 1. Update product_categories policies
DROP POLICY IF EXISTS "Admins and directors can manage categories" ON public.product_categories;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.product_categories;

-- Directors, admins, and sales_managers can manage categories
CREATE POLICY "Managers can manage categories" 
ON public.product_categories 
FOR ALL 
USING (
  has_role(auth.uid(), 'director'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'sales_manager'::app_role)
);

-- Categories are viewable by authenticated users
CREATE POLICY "Categories are viewable by authenticated users" 
ON public.product_categories 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 2. Update products policies
DROP POLICY IF EXISTS "Admins and directors can manage all products" ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;

-- Directors, admins, and sales_managers can manage products
CREATE POLICY "Managers can manage products" 
ON public.products 
FOR ALL 
USING (
  has_role(auth.uid(), 'director'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'sales_manager'::app_role)
);

-- Products are viewable by everyone (including anonymous for catalog)
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);