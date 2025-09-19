-- Allow salespersons to create leads assigned to themselves
CREATE POLICY "Salespersons can create their own leads"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'salesperson'::app_role)
  AND assigned_to = auth.uid()
  AND source <> 'website_form'
);