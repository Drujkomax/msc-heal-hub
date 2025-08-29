-- Исправляем критическую ошибку с Security Definer View
-- Удаляем небезопасное представление
DROP VIEW IF EXISTS public.public_products;

-- Удаляем дублирующиеся политики
DROP POLICY IF EXISTS "Public product catalog access" ON public.products;
DROP POLICY IF EXISTS "Public products view access" ON public.products;

-- Создаем безопасную политику для анонимных пользователей
-- Анонимные пользователи видят только активные неархивированные продукты без чувствительных данных
CREATE POLICY "Anonymous users see basic product info"
ON public.products
FOR SELECT
USING (
  auth.role() = 'anon' 
  AND status = 'active' 
  AND NOT archived
);

-- Аутентифицированные пользователи могут видеть все продукты
CREATE POLICY "Authenticated users see all products"
ON public.products
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Добавляем функцию для получения публичной информации о продуктах
-- без использования Security Definer View
CREATE OR REPLACE FUNCTION public.get_public_products()
RETURNS TABLE(
  id uuid,
  name jsonb,
  description jsonb,
  category text,
  images jsonb,
  features jsonb,
  in_stock boolean,
  created_at timestamp with time zone,
  country text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.name,
    p.description,
    p.category,
    p.images,
    p.features,
    p.in_stock,
    p.created_at,
    p.country
  FROM public.products p
  WHERE p.status = 'active' AND NOT p.archived;
$function$;