-- Создаем функцию для регистрации конкретного директора
CREATE OR REPLACE FUNCTION register_specific_director(
  user_id UUID,
  director_email TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Обновляем или создаем роль для конкретного пользователя
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_id, 'director')
  ON CONFLICT (user_id) 
  DO UPDATE SET role = 'director';
  
  result := json_build_object(
    'user_id', user_id,
    'email', director_email,
    'role', 'director',
    'message', 'Директор успешно зарегистрирован'
  );
  
  RETURN result;
END;
$$;