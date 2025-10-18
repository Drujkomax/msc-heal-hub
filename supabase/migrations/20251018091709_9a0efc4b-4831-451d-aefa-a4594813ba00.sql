-- Ensure authenticated users can call archive_product
GRANT EXECUTE ON FUNCTION public.archive_product(uuid, uuid) TO authenticated;