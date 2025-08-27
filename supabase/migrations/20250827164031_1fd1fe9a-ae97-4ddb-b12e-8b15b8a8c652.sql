-- Update RLS policy for anonymous lead submissions
DROP POLICY IF EXISTS "Allow anonymous users to submit leads" ON public.leads;

-- Create new policy that allows anonymous users to submit leads from website forms
CREATE POLICY "Allow anonymous lead submissions from website"
ON public.leads
FOR INSERT
WITH CHECK (
  -- Allow anonymous users to submit leads
  (auth.role() = 'anon' AND source = 'website_form' AND stage = 'new')
  OR
  -- Allow authenticated users to create leads
  (auth.uid() IS NOT NULL)
);

-- Ensure the source field has a default value for website submissions
ALTER TABLE public.leads 
ALTER COLUMN source SET DEFAULT 'website_form';