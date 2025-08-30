-- Завершаем исправления безопасности - обновляем оставшиеся функции

-- Заменяем функцию update_updated_at_column с правильным search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Заменяем функцию update_conversion_analytics с правильным search_path
CREATE OR REPLACE FUNCTION public.update_conversion_analytics(p_product_id uuid, p_date date DEFAULT CURRENT_DATE)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_views INTEGER;
  v_quotes INTEGER;
  v_conversion_rate DECIMAL(5,4);
BEGIN
  -- Получаем данные о товаре
  SELECT COALESCE(views_count, 0), COALESCE(quote_requests_count, 0)
  INTO v_views, v_quotes
  FROM public.products 
  WHERE id = p_product_id;
  
  -- Вычисляем конверсию
  v_conversion_rate := CASE 
    WHEN v_views > 0 THEN v_quotes::DECIMAL / v_views::DECIMAL
    ELSE 0.0000
  END;
  
  -- Обновляем или вставляем данные
  INSERT INTO public.conversion_analytics (product_id, date, views_count, quote_requests_count, conversion_rate)
  VALUES (p_product_id, p_date, v_views, v_quotes, v_conversion_rate)
  ON CONFLICT (product_id, date) 
  DO UPDATE SET
    views_count = EXCLUDED.views_count,
    quote_requests_count = EXCLUDED.quote_requests_count,
    conversion_rate = EXCLUDED.conversion_rate,
    updated_at = now();
    
  -- Обновляем конверсию в таблице товаров
  UPDATE public.products 
  SET conversion_rate = v_conversion_rate
  WHERE id = p_product_id;
END;
$function$;

-- Заменяем функцию log_employee_activity с правильным search_path
CREATE OR REPLACE FUNCTION public.log_employee_activity(p_action_type text, p_entity_type text DEFAULT NULL::text, p_entity_id uuid DEFAULT NULL::uuid, p_details jsonb DEFAULT '{}'::jsonb, p_session_duration integer DEFAULT NULL::integer)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.employee_activity (
    user_id, action_type, entity_type, entity_id, details, session_duration, date
  ) VALUES (
    auth.uid(), p_action_type, p_entity_type, p_entity_id, p_details, p_session_duration, CURRENT_DATE
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$function$;

-- Заменяем функцию get_employee_performance_metrics с правильным search_path
CREATE OR REPLACE FUNCTION public.get_employee_performance_metrics(p_user_id uuid, p_start_date date DEFAULT (CURRENT_DATE - '30 days'::interval), p_end_date date DEFAULT CURRENT_DATE)
 RETURNS TABLE(total_actions integer, daily_average numeric, most_active_day date, activity_breakdown jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_actions,
    (COUNT(*)::DECIMAL / GREATEST(1, (p_end_date - p_start_date + 1)))::DECIMAL(10,2) as daily_average,
    (SELECT date FROM public.employee_activity 
     WHERE user_id = p_user_id AND date BETWEEN p_start_date AND p_end_date
     GROUP BY date ORDER BY COUNT(*) DESC LIMIT 1) as most_active_day,
    json_build_object(
      'login_count', COUNT(*) FILTER (WHERE action_type = 'login'),
      'product_edits', COUNT(*) FILTER (WHERE action_type = 'product_edit'),
      'lead_updates', COUNT(*) FILTER (WHERE action_type = 'lead_update'),
      'deal_actions', COUNT(*) FILTER (WHERE action_type = 'deal_action')
    )::JSONB as activity_breakdown
  FROM public.employee_activity
  WHERE user_id = p_user_id 
    AND date BETWEEN p_start_date AND p_end_date;
END;
$function$;

-- Заменяем функцию create_user_invite с правильным search_path
CREATE OR REPLACE FUNCTION public.create_user_invite(invite_email text, invite_role app_role)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invite_id UUID;
  result JSON;
BEGIN
  -- Проверяем права
  IF NOT (has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'Недостаточно прав для создания приглашений';
  END IF;

  -- Создаем приглашение
  INSERT INTO public.user_invites (email, role, created_by)
  VALUES (invite_email, invite_role, auth.uid())
  RETURNING id INTO invite_id;
  
  result := json_build_object(
    'invite_id', invite_id,
    'email', invite_email,
    'role', invite_role,
    'invite_link', '/admin/register/' || invite_id
  );
  
  RETURN result;
END;
$function$;

-- Заменяем функцию create_first_director с правильным search_path
CREATE OR REPLACE FUNCTION public.create_first_director(director_email text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invite_id UUID;
  result JSON;
BEGIN
  -- Проверяем, нет ли уже директора в системе
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'director') THEN
    RAISE EXCEPTION 'Директор уже существует в системе';
  END IF;

  -- Создаем приглашение для директора
  INSERT INTO public.user_invites (email, role)
  VALUES (director_email, 'director')
  RETURNING id INTO invite_id;
  
  result := json_build_object(
    'invite_id', invite_id,
    'email', director_email,
    'role', 'director',
    'invite_link', '/admin/register/' || invite_id,
    'message', 'Создано приглашение для первого директора'
  );
  
  RETURN result;
END;
$function$;

-- Заменяем функцию validate_product_category с правильным search_path
CREATE OR REPLACE FUNCTION public.validate_product_category(category_value text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.product_categories 
    WHERE value = category_value
  );
END;
$function$;