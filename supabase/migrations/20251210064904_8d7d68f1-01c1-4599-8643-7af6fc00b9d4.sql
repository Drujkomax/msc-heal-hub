-- Create clinic activity logs table for tracking all actions
CREATE TABLE public.clinic_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'archived', 'restored'
  action_description TEXT NOT NULL,
  changed_fields JSONB DEFAULT '{}'::jsonb,
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clinic_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view clinic activity logs"
  ON public.clinic_activity_logs FOR SELECT
  USING (has_role_level(auth.uid(), 'salesperson'::app_role) OR has_role(auth.uid(), 'accountant'::app_role));

CREATE POLICY "System can insert clinic activity logs"
  ON public.clinic_activity_logs FOR INSERT
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_clinic_activity_logs_client_id ON public.clinic_activity_logs(client_id);
CREATE INDEX idx_clinic_activity_logs_created_at ON public.clinic_activity_logs(created_at DESC);

-- Create a function to log clinic activities
CREATE OR REPLACE FUNCTION public.log_clinic_activity(
  p_client_id UUID,
  p_action_type TEXT,
  p_action_description TEXT,
  p_changed_fields JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  activity_id UUID;
  v_user_email TEXT;
  v_user_name TEXT;
BEGIN
  -- Get user info
  SELECT p.email, COALESCE(p.full_name, p.email) INTO v_user_email, v_user_name
  FROM public.profiles p
  WHERE p.id = auth.uid();

  INSERT INTO public.clinic_activity_logs (
    client_id, action_type, action_description, changed_fields, user_id, user_email, user_name
  ) VALUES (
    p_client_id, p_action_type, p_action_description, p_changed_fields, auth.uid(), v_user_email, v_user_name
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;