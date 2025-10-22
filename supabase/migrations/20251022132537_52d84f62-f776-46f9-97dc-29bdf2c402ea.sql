-- Добавляем поле lead_created_date в таблицу leads
ALTER TABLE public.leads 
ADD COLUMN lead_created_date timestamp with time zone;