-- Salespersons need to read all user_roles so the "assign lead to..."
-- dropdown on the Leads page can list other salespersons. Previously
-- they could only read their own row via "Users can view their own roles".

DROP POLICY IF EXISTS "Salespersons can view all user roles" ON public.user_roles;

CREATE POLICY "Salespersons can view all user roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (has_role_level(auth.uid(), 'salesperson'::app_role));
