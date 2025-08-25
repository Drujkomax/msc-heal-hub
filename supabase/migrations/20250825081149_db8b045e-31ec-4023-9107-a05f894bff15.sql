-- Update app_role enum to include new roles
ALTER TYPE app_role ADD VALUE 'director';
ALTER TYPE app_role ADD VALUE 'sales_manager';
ALTER TYPE app_role ADD VALUE 'salesperson';

-- Create user activity logs table for director oversight
CREATE TABLE public.user_activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  action text NOT NULL,
  target_type text,
  target_id uuid,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on activity logs
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Add assigned_by field to leads table to track who assigned the lead
ALTER TABLE public.leads ADD COLUMN assigned_by uuid;

-- Create helper function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role_level(_user_id uuid, _min_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND (
        (_min_role = 'user' AND ur.role IN ('user', 'salesperson', 'sales_manager', 'admin', 'director')) OR
        (_min_role = 'salesperson' AND ur.role IN ('salesperson', 'sales_manager', 'admin', 'director')) OR
        (_min_role = 'sales_manager' AND ur.role IN ('sales_manager', 'admin', 'director')) OR
        (_min_role = 'admin' AND ur.role IN ('admin', 'director')) OR
        (_min_role = 'director' AND ur.role = 'director')
      )
  )
$$;

-- Create function to check if user can access specific lead
CREATE OR REPLACE FUNCTION public.can_access_lead(_user_id uuid, _lead_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    LEFT JOIN public.leads l ON l.id = _lead_id
    WHERE ur.user_id = _user_id
      AND (
        ur.role IN ('director', 'admin') OR
        (ur.role = 'salesperson' AND l.assigned_to = _user_id)
      )
  )
$$;

-- Update RLS policies for leads
DROP POLICY IF EXISTS "Admins can manage all leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view assigned leads" ON public.leads;

-- New comprehensive policies for leads
CREATE POLICY "Directors and admins can manage all leads" 
ON public.leads 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'director'::app_role));

CREATE POLICY "Salespersons can view assigned leads" 
ON public.leads 
FOR SELECT 
USING (
  has_role(auth.uid(), 'salesperson'::app_role) AND assigned_to = auth.uid()
);

CREATE POLICY "Salespersons can update assigned leads" 
ON public.leads 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'salesperson'::app_role) AND assigned_to = auth.uid()
);

-- RLS policies for user_activity_logs
CREATE POLICY "Directors can view all activity logs" 
ON public.user_activity_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'director'::app_role));

CREATE POLICY "Users can create their own activity logs" 
ON public.user_activity_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS policies for user_roles
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

CREATE POLICY "Directors can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'director'::app_role));

-- Create indexes for performance
CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON public.user_activity_logs(created_at);
CREATE INDEX idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX idx_leads_assigned_by ON public.leads(assigned_by);

-- Create trigger for automatic activity logging
CREATE OR REPLACE FUNCTION public.log_user_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only log if user is authenticated
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.user_activity_logs (
      user_id,
      action,
      target_type,
      target_id,
      details
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      CASE 
        WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW)
        WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
        WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
      END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add triggers for activity logging on important tables
CREATE TRIGGER log_leads_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.log_user_activity();

CREATE TRIGGER log_user_roles_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_user_activity();