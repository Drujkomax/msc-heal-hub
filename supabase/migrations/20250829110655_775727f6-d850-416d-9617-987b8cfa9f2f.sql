-- Исправляем функции без search_path
CREATE OR REPLACE FUNCTION public.archive_lead(lead_id uuid, user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.leads 
  SET 
    archived = true,
    archived_at = now(),
    archived_by = user_id
  WHERE id = lead_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.archive_product(product_id uuid, user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.products 
  SET 
    archived = true,
    archived_at = now(),
    archived_by = user_id
  WHERE id = product_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.unarchive_product(product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.products 
  SET 
    archived = false,
    archived_at = null,
    archived_by = null
  WHERE id = product_id;
END;
$$;