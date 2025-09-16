-- Create a function to validate invites safely for unauthenticated users
-- This avoids exposing the user_invites table via RLS and returns only minimal fields
CREATE OR REPLACE FUNCTION public.validate_invite(p_invite_id uuid)
RETURNS TABLE(email text, role app_role, id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT ui.email, ui.role, ui.id
  FROM public.user_invites ui
  WHERE ui.id = p_invite_id
    AND NOT ui.used
    AND ui.expires_at > now();
END;
$$;