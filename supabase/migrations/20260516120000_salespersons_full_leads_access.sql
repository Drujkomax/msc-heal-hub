-- Grant salespersons full access to the leads table.
--
-- Previously salespersons could only SELECT/UPDATE leads where
-- assigned_to = auth.uid(), and could only INSERT leads assigned to
-- themselves. This caused a mismatch with the frontend, which already
-- grants salespersons view_all_leads/manage_all_leads — they saw the
-- Leads page open but received only their assigned rows from RLS.
--
-- Sales managers / directors / admins are unaffected — they remain
-- covered by "Directors and sales managers can manage all leads".
-- The anon website-submission policy and the accountants view policy
-- are also unaffected.

DROP POLICY IF EXISTS "Salespersons can view only their assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Salespersons can view assigned leads"            ON public.leads;
DROP POLICY IF EXISTS "Salespersons can update assigned leads"          ON public.leads;
DROP POLICY IF EXISTS "Salespersons can create their own leads"         ON public.leads;

CREATE POLICY "Salespersons can manage all leads"
  ON public.leads
  FOR ALL
  TO authenticated
  USING      (has_role(auth.uid(), 'salesperson'::app_role))
  WITH CHECK (has_role(auth.uid(), 'salesperson'::app_role));
