-- Fix profiles table security issue: restrict access to employee personal information

-- Remove the overly permissive current SELECT policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a more restrictive policy that only allows authenticated users with specific roles
-- to access profiles, and users can always see their own profile
CREATE POLICY "Restrict profile access to authorized users"
ON public.profiles FOR SELECT 
USING (
  -- Users can always see their own profile
  auth.uid() = id OR 
  -- Only sales staff and above can see other employees' profiles for CRM functionality
  has_role_level(auth.uid(), 'salesperson'::app_role)
);

-- Add a policy comment for documentation
COMMENT ON POLICY "Restrict profile access to authorized users" ON public.profiles IS 
'Allows users to see their own profile and authorized sales staff to see employee profiles for CRM functionality';

-- Create a security definer function to get employee profiles with role-based access
CREATE OR REPLACE FUNCTION public.get_employee_profiles()
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  avatar_url text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.email, p.full_name, p.avatar_url
  FROM public.profiles p
  WHERE 
    -- Only return profiles if the requesting user has appropriate role
    has_role_level(auth.uid(), 'salesperson'::app_role)
  ORDER BY p.full_name, p.email;
$$;