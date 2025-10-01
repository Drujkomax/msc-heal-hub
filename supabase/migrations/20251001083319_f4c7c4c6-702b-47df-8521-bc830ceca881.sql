-- Добавляем поля статуса оплаты в таблицу deals
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'waiting' CHECK (payment_status IN ('waiting', 'paid', 'not_realized', 'debt')),
ADD COLUMN IF NOT EXISTS debt_amount numeric;

-- Комментарии для полей
COMMENT ON COLUMN public.deals.payment_status IS 'Статус оплаты: waiting (Ожидание), paid (Оплачено), not_realized (Не реализовано), debt (Задолженность)';
COMMENT ON COLUMN public.deals.debt_amount IS 'Сумма задолженности (заполняется только когда payment_status = debt)';