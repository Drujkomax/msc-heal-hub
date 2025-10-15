-- Add legal_name column to manufacturers table
ALTER TABLE public.manufacturers 
ADD COLUMN legal_name TEXT;

COMMENT ON COLUMN public.manufacturers.legal_name IS 'Юридическое наименование производителя';