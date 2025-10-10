-- Добавляем колонку для качества лида в таблицу leads
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS lead_quality TEXT CHECK (lead_quality IN ('A', 'B', 'C'));

-- Добавляем комментарий для документации
COMMENT ON COLUMN public.leads.lead_quality IS 'Качество лида: A - целевой, B - потенциальный, C - мусор';