-- Function to return employees with their roles, accessible to accountants and sales team
CREATE OR REPLACE FUNCTION public.get_employees_with_roles()
RETURNS TABLE(id uuid, email text, full_name text, role app_role)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT ur.user_id AS id,
         p.email,
         COALESCE(p.full_name, p.email) AS full_name,
         ur.role
  FROM public.user_roles ur
  JOIN public.profiles p ON p.id = ur.user_id
  WHERE has_role_level(auth.uid(), 'salesperson'::app_role)
     OR has_role(auth.uid(), 'accountant'::app_role);
$function$;