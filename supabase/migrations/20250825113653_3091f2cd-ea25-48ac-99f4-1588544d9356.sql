-- Создаем функцию для создания приглашений
CREATE OR REPLACE FUNCTION create_user_invite(
  invite_email TEXT,
  invite_role app_role
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Создаем функцию для принятия приглашения
CREATE OR REPLACE FUNCTION accept_invite(
  invite_id UUID,
  user_password TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_record public.user_invites;
  result JSON;
BEGIN
  -- Получаем приглашение
  SELECT * INTO invite_record
  FROM public.user_invites
  WHERE id = invite_id
    AND NOT used
    AND expires_at > now();
    
  IF invite_record IS NULL THEN
    RAISE EXCEPTION 'Приглашение недействительно или истекло';
  END IF;
  
  -- Помечаем приглашение как использованное
  UPDATE public.user_invites 
  SET used = true 
  WHERE id = invite_id;
  
  result := json_build_object(
    'email', invite_record.email,
    'role', invite_record.role,
    'message', 'Приглашение принято. Теперь зарегистрируйтесь с этим email.'
  );
  
  RETURN result;
END;
$$;