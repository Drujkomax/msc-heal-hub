-- Drop and recreate the register_specific_director function with fixed parameters
DROP FUNCTION IF EXISTS public.register_specific_director(uuid, text);

CREATE OR REPLACE FUNCTION public.register_specific_director(user_uuid uuid, director_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result JSON;
BEGIN
  -- Обновляем или создаем роль для конкретного пользователя
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_uuid, 'director')
  ON CONFLICT (user_id) 
  DO UPDATE SET role = 'director';
  
  result := json_build_object(
    'user_id', user_uuid,
    'email', director_email,
    'role', 'director',
    'message', 'Директор успешно зарегистрирован'
  );
  
  RETURN result;
END;
$function$;

-- Now register the director for the current user
SELECT public.register_specific_director('b5c09100-d1b1-47c3-98f6-cb0f4eaab0c1', 'director@medsc.uz');