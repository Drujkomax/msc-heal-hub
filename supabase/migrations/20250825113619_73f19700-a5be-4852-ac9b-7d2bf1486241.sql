-- Создаем функцию для создания пользователей (только для директора и админа)
CREATE OR REPLACE FUNCTION create_user_account(
  user_email TEXT,
  user_password TEXT,
  user_role app_role
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Проверяем, что текущий пользователь имеет права создавать аккаунты
  IF NOT (has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'Недостаточно прав для создания пользователей';
  END IF;

  -- Создаем временного пользователя
  new_user_id := gen_random_uuid();
  
  -- Добавляем роль в нашу таблицу
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, user_role);
  
  -- Возвращаем информацию о созданном пользователе
  result := json_build_object(
    'user_id', new_user_id,
    'email', user_email,
    'role', user_role,
    'message', 'Пользователь создан. Попросите его зарегистрироваться по ссылке /admin/register/' || new_user_id
  );
  
  RETURN result;
END;
$$;

-- Создаем первого директора (замените email на нужный)
-- Сначала создаем пользователя вручную
INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'director')
ON CONFLICT (user_id) DO UPDATE SET role = 'director';

-- Создаем функцию для инвайтов
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

  invite_id := gen_random_uuid();
  
  -- Создаем приглашение (можно создать отдельную таблицу для инвайтов)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (invite_id, invite_role);
  
  result := json_build_object(
    'invite_id', invite_id,
    'email', invite_email,
    'role', invite_role,
    'invite_link', '/admin/accept-invite/' || invite_id
  );
  
  RETURN result;
END;
$$;