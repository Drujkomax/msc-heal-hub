-- Пересоздаем триггер с правильным типом AFTER для INSERT/UPDATE
DROP TRIGGER IF EXISTS deal_audit_trigger ON public.deals;

CREATE TRIGGER deal_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.deals
FOR EACH ROW
EXECUTE FUNCTION public.log_deal_changes();

-- Добавляем начальные записи аудита для существующих сделок
INSERT INTO public.deal_audit_log (deal_id, user_id, action_type, new_values, user_email, user_role, created_at)
SELECT 
  d.id as deal_id,
  d.created_by as user_id,
  'created' as action_type,
  to_jsonb(d) as new_values,
  p.email as user_email,
  ur.role::TEXT as user_role,
  d.created_at
FROM public.deals d
LEFT JOIN public.profiles p ON p.id = d.created_by
LEFT JOIN public.user_roles ur ON ur.user_id = d.created_by
WHERE NOT EXISTS (
  SELECT 1 FROM public.deal_audit_log 
  WHERE deal_id = d.id AND action_type = 'created'
);