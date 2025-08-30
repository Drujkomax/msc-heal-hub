-- Создаем таблицу для системных ошибок и логов
CREATE TABLE public.system_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL DEFAULT 'info', -- error, warn, info, debug
  category TEXT NOT NULL, -- auth, api, business, performance, security
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  url TEXT,
  stack_trace TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создаем индексы для быстрого поиска
CREATE INDEX idx_system_logs_level ON public.system_logs(level);
CREATE INDEX idx_system_logs_category ON public.system_logs(category);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at);
CREATE INDEX idx_system_logs_user_id ON public.system_logs(user_id);

-- Создаем таблицу для алертов
CREATE TABLE public.system_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL, -- critical_error, performance_issue, security_breach, high_activity
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  status TEXT NOT NULL DEFAULT 'active', -- active, acknowledged, resolved
  details JSONB DEFAULT '{}',
  triggered_by_log_id UUID REFERENCES public.system_logs(id),
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создаем индексы для алертов
CREATE INDEX idx_system_alerts_status ON public.system_alerts(status);
CREATE INDEX idx_system_alerts_severity ON public.system_alerts(severity);
CREATE INDEX idx_system_alerts_created_at ON public.system_alerts(created_at);

-- Включаем RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

-- Политики для логов - только администраторы и директора
CREATE POLICY "Directors and admins can view all logs" 
ON public.system_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert logs" 
ON public.system_logs 
FOR INSERT 
WITH CHECK (true);

-- Политики для алертов - только администраторы и директора
CREATE POLICY "Directors and admins can manage alerts" 
ON public.system_alerts 
FOR ALL 
USING (has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'admin'));

-- Функция для логирования системных событий
CREATE OR REPLACE FUNCTION public.log_system_event(
  p_level TEXT,
  p_category TEXT,
  p_message TEXT,
  p_details JSONB DEFAULT '{}',
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_url TEXT DEFAULT NULL,
  p_stack_trace TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  log_id UUID;
  should_alert BOOLEAN := false;
BEGIN
  -- Вставляем лог
  INSERT INTO public.system_logs (
    level, category, message, details, user_id, 
    ip_address, user_agent, url, stack_trace
  ) VALUES (
    p_level, p_category, p_message, p_details, COALESCE(p_user_id, auth.uid()),
    p_ip_address, p_user_agent, p_url, p_stack_trace
  ) RETURNING id INTO log_id;
  
  -- Проверяем нужно ли создать алерт
  should_alert := (
    p_level = 'error' OR 
    p_category = 'security' OR
    (p_category = 'performance' AND (p_details->>'duration')::NUMERIC > 5000)
  );
  
  -- Создаем алерт если нужно
  IF should_alert THEN
    INSERT INTO public.system_alerts (
      alert_type, title, description, severity, details, triggered_by_log_id
    ) VALUES (
      CASE 
        WHEN p_level = 'error' AND p_category = 'security' THEN 'security_breach'
        WHEN p_level = 'error' THEN 'critical_error'
        WHEN p_category = 'performance' THEN 'performance_issue'
        ELSE 'system_issue'
      END,
      CASE 
        WHEN p_level = 'error' THEN 'Системная ошибка: ' || p_message
        WHEN p_category = 'security' THEN 'Проблема безопасности: ' || p_message
        WHEN p_category = 'performance' THEN 'Проблема производительности: ' || p_message
        ELSE p_message
      END,
      p_message,
      CASE 
        WHEN p_level = 'error' AND p_category = 'security' THEN 'critical'
        WHEN p_level = 'error' THEN 'high'
        ELSE 'medium'
      END,
      p_details,
      log_id
    );
  END IF;
  
  RETURN log_id;
END;
$function$;

-- Функция для получения статистики логов
CREATE OR REPLACE FUNCTION public.get_log_statistics(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
  p_end_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE(
  date DATE,
  total_logs INTEGER,
  error_count INTEGER,
  warn_count INTEGER,
  info_count INTEGER,
  categories JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(sl.created_at) as date,
    COUNT(*)::INTEGER as total_logs,
    COUNT(*) FILTER (WHERE sl.level = 'error')::INTEGER as error_count,
    COUNT(*) FILTER (WHERE sl.level = 'warn')::INTEGER as warn_count,
    COUNT(*) FILTER (WHERE sl.level = 'info')::INTEGER as info_count,
    json_object_agg(sl.category, COUNT(*))::JSONB as categories
  FROM public.system_logs sl
  WHERE DATE(sl.created_at) BETWEEN p_start_date AND p_end_date
  GROUP BY DATE(sl.created_at)
  ORDER BY DATE(sl.created_at) DESC;
END;
$function$;