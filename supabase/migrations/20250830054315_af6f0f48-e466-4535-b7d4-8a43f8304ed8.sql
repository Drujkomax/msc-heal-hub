-- Fix RLS policies for leads table to prevent unauthorized access to sensitive customer data

-- Drop existing potentially problematic SELECT policies
DROP POLICY IF EXISTS "Users can view assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Salespersons can view assigned leads" ON public.leads;

-- Create new, more restrictive SELECT policies
-- Only allow authenticated users with proper roles to view leads they're assigned to or have authority over
CREATE POLICY "Salespersons can view only their assigned leads" 
ON public.leads 
FOR SELECT 
USING (
  -- Must be authenticated
  auth.uid() IS NOT NULL
  AND
  -- Must have salesperson role or higher AND be assigned to the lead
  (
    (has_role(auth.uid(), 'salesperson'::app_role) AND assigned_to = auth.uid())
    OR
    -- Sales managers, admins, and directors can view all leads
    has_role_level(auth.uid(), 'sales_manager'::app_role)
  )
);

-- Ensure anonymous users cannot SELECT any lead data
CREATE POLICY "Block anonymous lead access" 
ON public.leads 
FOR SELECT 
USING (
  -- Explicitly deny anonymous access to lead data
  auth.uid() IS NOT NULL
);