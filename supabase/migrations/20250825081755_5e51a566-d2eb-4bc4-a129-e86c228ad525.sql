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

-- Create helper function to check if user has specific role level
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

-- Create function to get user role directly
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT ur.role
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
  LIMIT 1
$$;

-- Update RLS policies for leads
DROP POLICY IF EXISTS "Directors and admins can manage all leads" ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous users to submit leads" ON public.leads;

-- New comprehensive policies for leads
CREATE POLICY "Directors and sales managers can manage all leads" 
ON public.leads 
FOR ALL 
USING (
  has_role(auth.uid(), 'director'::app_role) OR 
  has_role(auth.uid(), 'sales_manager'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

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

CREATE POLICY "Allow anonymous users to submit leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (
  (source = 'website_form'::text) AND (stage = 'new'::text)
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

-- Update RLS policies for user_roles
DROP POLICY IF EXISTS "Directors can manage all roles" ON public.user_roles;

CREATE POLICY "Directors can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'director'::app_role));

-- Create indexes for performance
CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON public.user_activity_logs(created_at);
CREATE INDEX idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX idx_leads_assigned_by ON public.leads(assigned_by);