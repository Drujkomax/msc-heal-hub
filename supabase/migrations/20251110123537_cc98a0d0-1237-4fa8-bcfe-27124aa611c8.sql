-- Обновляем существующую таблицу clients, добавляя недостающие поля
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS legal_name TEXT,
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS inn TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES auth.users(id);

-- Создаем таблицу инвентаря клиентов
CREATE TABLE IF NOT EXISTS public.client_stock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  warehouse_item_id UUID REFERENCES public.warehouse_items(id) ON DELETE SET NULL,
  
  -- Если товар кастомный (не из продуктов)
  custom_item_name JSONB, -- { ru: '', en: '', uz: '' }
  custom_item_description TEXT,
  
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'шт',
  
  -- Настройки уведомлений о низких остатках
  minimum_stock INTEGER DEFAULT 0,
  notify_low_stock BOOLEAN DEFAULT false,
  notification_threshold_days INTEGER DEFAULT 30,
  
  -- Информация о расходе (для расчета когда закончится)
  average_monthly_consumption DECIMAL(10,2),
  last_refill_date TIMESTAMP WITH TIME ZONE,
  estimated_depletion_date TIMESTAMP WITH TIME ZONE,
  
  location TEXT,
  serial_numbers TEXT[],
  
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создаем таблицу транзакций инвентаря
CREATE TABLE IF NOT EXISTS public.client_stock_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_stock_id UUID NOT NULL REFERENCES public.client_stock(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('initial', 'incoming', 'outgoing', 'adjustment', 'transfer')),
  quantity INTEGER NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  
  reason TEXT,
  notes TEXT,
  
  deal_id UUID REFERENCES public.deals(id),
  document_url TEXT,
  
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создаем таблицу для настроек уведомлений
CREATE TABLE IF NOT EXISTS public.client_stock_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_stock_id UUID NOT NULL REFERENCES public.client_stock(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  
  alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'expiring_soon', 'expired')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  message TEXT NOT NULL,
  telegram_sent BOOLEAN DEFAULT false,
  telegram_sent_at TIMESTAMP WITH TIME ZONE,
  
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Добавляем поле client_id к таблице leads для связи с клиниками
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- Создаем индексы
CREATE INDEX IF NOT EXISTS idx_clients_archived ON public.clients(archived);
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON public.clients(created_by);
CREATE INDEX IF NOT EXISTS idx_client_stock_client ON public.client_stock(client_id);
CREATE INDEX IF NOT EXISTS idx_client_stock_product ON public.client_stock(product_id);
CREATE INDEX IF NOT EXISTS idx_client_stock_warehouse ON public.client_stock(warehouse_item_id);
CREATE INDEX IF NOT EXISTS idx_client_stock_notify ON public.client_stock(notify_low_stock) WHERE notify_low_stock = true;
CREATE INDEX IF NOT EXISTS idx_client_stock_transactions_client ON public.client_stock_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_client_stock_transactions_stock ON public.client_stock_transactions(client_stock_id);
CREATE INDEX IF NOT EXISTS idx_client_stock_alerts_client ON public.client_stock_alerts(client_id);
CREATE INDEX IF NOT EXISTS idx_client_stock_alerts_unresolved ON public.client_stock_alerts(resolved) WHERE resolved = false;
CREATE INDEX IF NOT EXISTS idx_leads_client ON public.leads(client_id);

-- Триггер для обновления updated_at в clients
CREATE OR REPLACE FUNCTION update_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clients_updated_at_trigger ON public.clients;
CREATE TRIGGER update_clients_updated_at_trigger
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION update_clients_updated_at();

-- Триггер для client_stock
DROP TRIGGER IF EXISTS update_client_stock_updated_at_trigger ON public.client_stock;
CREATE TRIGGER update_client_stock_updated_at_trigger
  BEFORE UPDATE ON public.client_stock
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Функция для расчета даты окончания запасов
CREATE OR REPLACE FUNCTION calculate_stock_depletion_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.average_monthly_consumption IS NOT NULL AND NEW.average_monthly_consumption > 0 AND NEW.quantity > 0 THEN
    NEW.estimated_depletion_date := CURRENT_DATE + (NEW.quantity / NEW.average_monthly_consumption * 30)::INTEGER;
  ELSE
    NEW.estimated_depletion_date := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_stock_depletion_trigger ON public.client_stock;
CREATE TRIGGER calculate_stock_depletion_trigger
  BEFORE INSERT OR UPDATE OF quantity, average_monthly_consumption ON public.client_stock
  FOR EACH ROW
  EXECUTE FUNCTION calculate_stock_depletion_date();

-- Функция для логирования изменений
CREATE OR REPLACE FUNCTION log_stock_change()
RETURNS TRIGGER AS $$
DECLARE
  trans_type TEXT;
  qty_change INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    trans_type := 'initial';
    qty_change := NEW.quantity;
    
    INSERT INTO public.client_stock_transactions (
      client_stock_id, client_id, transaction_type, 
      quantity, quantity_before, quantity_after, performed_by
    ) VALUES (
      NEW.id, NEW.client_id, trans_type, 
      qty_change, 0, NEW.quantity, NEW.created_by
    );
    
  ELSIF TG_OP = 'UPDATE' AND OLD.quantity <> NEW.quantity THEN
    qty_change := NEW.quantity - OLD.quantity;
    
    IF qty_change > 0 THEN
      trans_type := 'incoming';
    ELSE
      trans_type := 'outgoing';
    END IF;
    
    INSERT INTO public.client_stock_transactions (
      client_stock_id, client_id, transaction_type, 
      quantity, quantity_before, quantity_after, performed_by
    ) VALUES (
      NEW.id, NEW.client_id, trans_type, 
      ABS(qty_change), OLD.quantity, NEW.quantity, NEW.updated_by
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_stock_change_trigger ON public.client_stock;
CREATE TRIGGER log_stock_change_trigger
  AFTER INSERT OR UPDATE OF quantity ON public.client_stock
  FOR EACH ROW
  EXECUTE FUNCTION log_stock_change();

-- Функция для проверки низких остатков
CREATE OR REPLACE FUNCTION check_low_stock_alerts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.notify_low_stock = true AND NEW.quantity <= NEW.minimum_stock THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.client_stock_alerts
      WHERE client_stock_id = NEW.id 
        AND alert_type IN ('low_stock', 'out_of_stock')
        AND resolved = false
    ) THEN
      INSERT INTO public.client_stock_alerts (
        client_stock_id, client_id, alert_type, severity, message
      ) VALUES (
        NEW.id, 
        NEW.client_id,
        CASE 
          WHEN NEW.quantity = 0 THEN 'out_of_stock'
          ELSE 'low_stock'
        END,
        CASE 
          WHEN NEW.quantity = 0 THEN 'critical'
          WHEN NEW.quantity <= NEW.minimum_stock * 0.5 THEN 'high'
          ELSE 'medium'
        END,
        CASE 
          WHEN NEW.quantity = 0 THEN 'Запасы закончились!'
          ELSE 'Низкий остаток: ' || NEW.quantity || ' ' || NEW.unit
        END
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_low_stock_alerts_trigger ON public.client_stock;
CREATE TRIGGER check_low_stock_alerts_trigger
  AFTER INSERT OR UPDATE OF quantity ON public.client_stock
  FOR EACH ROW
  EXECUTE FUNCTION check_low_stock_alerts();

-- RLS для clients (обновляем политики)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Managers can view all clients" ON public.clients;
CREATE POLICY "Managers can view all clients"
  ON public.clients FOR SELECT
  USING (has_role_level(auth.uid(), 'salesperson'::app_role));

DROP POLICY IF EXISTS "Managers can create clients" ON public.clients;
CREATE POLICY "Managers can create clients"
  ON public.clients FOR INSERT
  WITH CHECK (has_role_level(auth.uid(), 'salesperson'::app_role));

DROP POLICY IF EXISTS "Managers can update clients" ON public.clients;
CREATE POLICY "Managers can update clients"
  ON public.clients FOR UPDATE
  USING (has_role_level(auth.uid(), 'salesperson'::app_role));

DROP POLICY IF EXISTS "Directors can delete clients" ON public.clients;
CREATE POLICY "Directors can delete clients"
  ON public.clients FOR DELETE
  USING (has_role_level(auth.uid(), 'admin'::app_role));

-- RLS для client_stock
ALTER TABLE public.client_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can view all client stock"
  ON public.client_stock FOR SELECT
  USING (has_role_level(auth.uid(), 'salesperson'::app_role) OR has_role(auth.uid(), 'accountant'::app_role));

CREATE POLICY "Managers can manage client stock"
  ON public.client_stock FOR ALL
  USING (has_role_level(auth.uid(), 'salesperson'::app_role));

-- RLS для client_stock_transactions
ALTER TABLE public.client_stock_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stock transactions"
  ON public.client_stock_transactions FOR SELECT
  USING (has_role_level(auth.uid(), 'salesperson'::app_role) OR has_role(auth.uid(), 'accountant'::app_role));

CREATE POLICY "System can create transactions"
  ON public.client_stock_transactions FOR INSERT
  WITH CHECK (true);

-- RLS для client_stock_alerts
ALTER TABLE public.client_stock_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view alerts"
  ON public.client_stock_alerts FOR SELECT
  USING (has_role_level(auth.uid(), 'salesperson'::app_role) OR has_role(auth.uid(), 'accountant'::app_role));

CREATE POLICY "Managers can manage alerts"
  ON public.client_stock_alerts FOR ALL
  USING (has_role_level(auth.uid(), 'salesperson'::app_role));

-- Полезные функции
CREATE OR REPLACE FUNCTION get_clients_with_low_stock()
RETURNS TABLE (
  client_id UUID,
  client_name TEXT,
  low_stock_count BIGINT,
  critical_count BIGINT
) 
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.id as client_id,
    c.name as client_name,
    COUNT(*) FILTER (WHERE cs.quantity <= cs.minimum_stock AND cs.quantity > 0) as low_stock_count,
    COUNT(*) FILTER (WHERE cs.quantity = 0) as critical_count
  FROM public.clients c
  JOIN public.client_stock cs ON cs.client_id = c.id
  WHERE cs.notify_low_stock = true 
    AND cs.quantity <= cs.minimum_stock
    AND c.archived = false
  GROUP BY c.id, c.name
  ORDER BY critical_count DESC, low_stock_count DESC;
$$;

CREATE OR REPLACE FUNCTION archive_client(p_client_id UUID, p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (has_role(p_user_id, 'director'::app_role) OR has_role(p_user_id, 'admin'::app_role)) THEN
    RAISE EXCEPTION 'У вас нет прав для архивирования клиентов';
  END IF;

  UPDATE public.clients 
  SET 
    archived = true,
    archived_at = now(),
    archived_by = p_user_id,
    updated_at = now()
  WHERE id = p_client_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Клиент не найден';
  END IF;
END;
$$;