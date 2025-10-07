-- Fix SECURITY DEFINER functions by adding search_path

-- 1. update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2. update_contact_inquiries_updated_at
CREATE OR REPLACE FUNCTION public.update_contact_inquiries_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 3. log_deal_changes (keeping existing logic)
CREATE OR REPLACE FUNCTION public.log_deal_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_email TEXT;
  user_role TEXT;
  changed_fields TEXT[] := ARRAY[]::TEXT[];
  old_vals JSONB := '{}'::JSONB;
  new_vals JSONB := '{}'::JSONB;
  action TEXT;
BEGIN
  -- Получаем email и роль пользователя
  SELECT p.email INTO user_email
  FROM public.profiles p
  WHERE p.id = auth.uid();
  
  SELECT ur.role::TEXT INTO user_role
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid();

  IF TG_OP = 'INSERT' THEN
    action := 'created';
    new_vals := to_jsonb(NEW);
    
    INSERT INTO public.deal_audit_log (
      deal_id, user_id, action_type, new_values, user_email, user_role
    ) VALUES (
      NEW.id, auth.uid(), action, new_vals, user_email, user_role
    );
    
  ELSIF TG_OP = 'UPDATE' THEN
    action := 'updated';
    
    -- Определяем какие поля изменились
    IF OLD.title IS DISTINCT FROM NEW.title THEN
      changed_fields := array_append(changed_fields, 'title');
      old_vals := jsonb_set(old_vals, '{title}', to_jsonb(OLD.title));
      new_vals := jsonb_set(new_vals, '{title}', to_jsonb(NEW.title));
    END IF;
    
    IF OLD.amount IS DISTINCT FROM NEW.amount THEN
      changed_fields := array_append(changed_fields, 'amount');
      old_vals := jsonb_set(old_vals, '{amount}', to_jsonb(OLD.amount));
      new_vals := jsonb_set(new_vals, '{amount}', to_jsonb(NEW.amount));
    END IF;
    
    IF OLD.stage IS DISTINCT FROM NEW.stage THEN
      changed_fields := array_append(changed_fields, 'stage');
      old_vals := jsonb_set(old_vals, '{stage}', to_jsonb(OLD.stage));
      new_vals := jsonb_set(new_vals, '{stage}', to_jsonb(NEW.stage));
      action := 'stage_changed';
    END IF;
    
    IF OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
      changed_fields := array_append(changed_fields, 'payment_status');
      old_vals := jsonb_set(old_vals, '{payment_status}', to_jsonb(OLD.payment_status));
      new_vals := jsonb_set(new_vals, '{payment_status}', to_jsonb(NEW.payment_status));
      IF action = 'updated' THEN
        action := 'payment_status_changed';
      END IF;
    END IF;
    
    IF OLD.assigned_salesperson IS DISTINCT FROM NEW.assigned_salesperson OR
       OLD.assigned_engineer IS DISTINCT FROM NEW.assigned_engineer OR
       OLD.assigned_accountant IS DISTINCT FROM NEW.assigned_accountant THEN
      changed_fields := array_append(changed_fields, 'assignments');
      old_vals := jsonb_set(old_vals, '{assignments}', jsonb_build_object(
        'salesperson', OLD.assigned_salesperson,
        'engineer', OLD.assigned_engineer,
        'accountant', OLD.assigned_accountant
      ));
      new_vals := jsonb_set(new_vals, '{assignments}', jsonb_build_object(
        'salesperson', NEW.assigned_salesperson,
        'engineer', NEW.assigned_engineer,
        'accountant', NEW.assigned_accountant
      ));
      IF action = 'updated' THEN
        action := 'assigned';
      END IF;
    END IF;
    
    IF OLD.debt_amount IS DISTINCT FROM NEW.debt_amount THEN
      changed_fields := array_append(changed_fields, 'debt_amount');
      old_vals := jsonb_set(old_vals, '{debt_amount}', to_jsonb(OLD.debt_amount));
      new_vals := jsonb_set(new_vals, '{debt_amount}', to_jsonb(NEW.debt_amount));
    END IF;
    
    IF OLD.notes IS DISTINCT FROM NEW.notes THEN
      changed_fields := array_append(changed_fields, 'notes');
      old_vals := jsonb_set(old_vals, '{notes}', to_jsonb(OLD.notes));
      new_vals := jsonb_set(new_vals, '{notes}', to_jsonb(NEW.notes));
    END IF;
    
    -- Вставляем запись только если что-то изменилось
    IF array_length(changed_fields, 1) > 0 THEN
      INSERT INTO public.deal_audit_log (
        deal_id, user_id, action_type, old_values, new_values, 
        changed_fields, user_email, user_role
      ) VALUES (
        NEW.id, auth.uid(), action, old_vals, new_vals, 
        changed_fields, user_email, user_role
      );
    END IF;
    
  ELSIF TG_OP = 'DELETE' THEN
    action := 'deleted';
    old_vals := to_jsonb(OLD);
    
    INSERT INTO public.deal_audit_log (
      deal_id, user_id, action_type, old_values, user_email, user_role
    ) VALUES (
      OLD.id, auth.uid(), action, old_vals, user_email, user_role
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 4. handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- По умолчанию новые пользователи получают роль 'user'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$function$;

-- 5. handle_new_user_profile
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Upsert profile to avoid duplicate key errors if multiple triggers fire
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);
  RETURN NEW;
END;
$function$;

-- Add database-level length constraints for leads table
ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS name_length,
  DROP CONSTRAINT IF EXISTS phone_length,
  DROP CONSTRAINT IF EXISTS company_length,
  DROP CONSTRAINT IF EXISTS notes_length;

ALTER TABLE public.leads
  ADD CONSTRAINT name_length CHECK (length(name) <= 100),
  ADD CONSTRAINT phone_length CHECK (length(phone) <= 20),
  ADD CONSTRAINT company_length CHECK (length(company) <= 200),
  ADD CONSTRAINT notes_length CHECK (length(notes) <= 1000);