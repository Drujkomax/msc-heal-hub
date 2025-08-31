-- Создание таблицы для активности лидов (логи действий и заметки)
CREATE TABLE public.lead_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('note', 'status_change', 'contact', 'system', 'field_update', 'assignment')),
  content TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Создание индексов для лучшей производительности
CREATE INDEX idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX idx_lead_activities_created_at ON public.lead_activities(created_at DESC);
CREATE INDEX idx_lead_activities_type ON public.lead_activities(type);

-- Включение RLS
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- Политики RLS для активности лидов
CREATE POLICY "Users can view lead activities they have access to" 
ON public.lead_activities 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.leads l 
    WHERE l.id = lead_id 
    AND (
      has_role_level(auth.uid(), 'sales_manager'::app_role) OR
      (has_role(auth.uid(), 'salesperson'::app_role) AND l.assigned_to = auth.uid())
    )
  )
);

CREATE POLICY "Users can create activities for their leads" 
ON public.lead_activities 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leads l 
    WHERE l.id = lead_id 
    AND (
      has_role_level(auth.uid(), 'sales_manager'::app_role) OR
      (has_role(auth.uid(), 'salesperson'::app_role) AND l.assigned_to = auth.uid())
    )
  )
  AND auth.uid() = created_by
);

-- Создание функции для автоматического логирования изменений лида
CREATE OR REPLACE FUNCTION public.log_lead_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  activity_content TEXT;
  activity_type TEXT;
BEGIN
  -- Логируем изменение статуса
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    activity_content := 'Статус изменен с "' || 
      CASE OLD.stage 
        WHEN 'new' THEN 'Новый'
        WHEN 'contacted' THEN 'Связались'
        WHEN 'qualified' THEN 'Квалифицирован'
        WHEN 'proposal' THEN 'Предложение'
        WHEN 'negotiation' THEN 'Переговоры'
        WHEN 'closed' THEN 'Закрыт'
        WHEN 'lost' THEN 'Потерян'
        ELSE OLD.stage
      END || 
      '" на "' || 
      CASE NEW.stage 
        WHEN 'new' THEN 'Новый'
        WHEN 'contacted' THEN 'Связались'
        WHEN 'qualified' THEN 'Квалифицирован'
        WHEN 'proposal' THEN 'Предложение'
        WHEN 'negotiation' THEN 'Переговоры'
        WHEN 'closed' THEN 'Закрыт'
        WHEN 'lost' THEN 'Потерян'
        ELSE NEW.stage
      END || '"';
    
    INSERT INTO public.lead_activities (lead_id, type, content, old_value, new_value, created_by)
    VALUES (NEW.id, 'status_change', activity_content, OLD.stage, NEW.stage, auth.uid());
  END IF;
  
  -- Логируем изменение назначения
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    activity_content := CASE 
      WHEN OLD.assigned_to IS NULL AND NEW.assigned_to IS NOT NULL THEN
        'Лид назначен менеджеру'
      WHEN OLD.assigned_to IS NOT NULL AND NEW.assigned_to IS NULL THEN
        'Назначение лида снято'
      ELSE
        'Лид переназначен другому менеджеру'
    END;
    
    INSERT INTO public.lead_activities (lead_id, type, content, old_value, new_value, created_by)
    VALUES (NEW.id, 'assignment', activity_content, OLD.assigned_to::TEXT, NEW.assigned_to::TEXT, auth.uid());
  END IF;
  
  -- Логируем изменение основных полей
  IF OLD.name IS DISTINCT FROM NEW.name OR 
     OLD.phone IS DISTINCT FROM NEW.phone OR 
     OLD.company IS DISTINCT FROM NEW.company OR 
     OLD.email IS DISTINCT FROM NEW.email THEN
    
    INSERT INTO public.lead_activities (lead_id, type, content, created_by, metadata)
    VALUES (NEW.id, 'field_update', 'Информация о лиде обновлена', auth.uid(), 
      json_build_object(
        'updated_fields', json_build_object(
          'name', CASE WHEN OLD.name IS DISTINCT FROM NEW.name THEN json_build_object('old', OLD.name, 'new', NEW.name) ELSE NULL END,
          'phone', CASE WHEN OLD.phone IS DISTINCT FROM NEW.phone THEN json_build_object('old', OLD.phone, 'new', NEW.phone) ELSE NULL END,
          'company', CASE WHEN OLD.company IS DISTINCT FROM NEW.company THEN json_build_object('old', OLD.company, 'new', NEW.company) ELSE NULL END,
          'email', CASE WHEN OLD.email IS DISTINCT FROM NEW.email THEN json_build_object('old', OLD.email, 'new', NEW.email) ELSE NULL END
        )
      )::jsonb
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Создание триггера для автоматического логирования
CREATE TRIGGER lead_changes_log_trigger
  AFTER UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.log_lead_changes();

-- Добавление начальной активности для существующих лидов
INSERT INTO public.lead_activities (lead_id, type, content, created_by)
SELECT id, 'system', 'Лид создан в системе', NULL
FROM public.leads
WHERE NOT EXISTS (
  SELECT 1 FROM public.lead_activities 
  WHERE lead_id = leads.id AND type = 'system'
);