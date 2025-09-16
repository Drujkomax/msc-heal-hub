-- Создаем функцию для автоматического подтверждения пользователей при регистрации через приглашения
CREATE OR REPLACE FUNCTION public.confirm_user_registration(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result JSON;
BEGIN
  -- Обновляем данные пользователя в auth.users для подтверждения email
  UPDATE auth.users 
  SET 
    email_confirmed_at = now(),
    confirmed_at = now()
  WHERE id = user_id AND email_confirmed_at IS NULL;
  
  result := json_build_object(
    'user_id', user_id,
    'message', 'Пользователь подтверждён',
    'confirmed_at', now()
  );
  
  RETURN result;
END;
$$;