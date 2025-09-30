-- Удаляем старое ограничение на deal_type
ALTER TABLE public.deals DROP CONSTRAINT IF EXISTS deals_deal_type_check;

-- Добавляем новое ограничение, которое позволяет все типы сделок включая NULL
ALTER TABLE public.deals ADD CONSTRAINT deals_deal_type_check 
CHECK (deal_type IN ('product', 'service', 'both') OR deal_type IS NULL);