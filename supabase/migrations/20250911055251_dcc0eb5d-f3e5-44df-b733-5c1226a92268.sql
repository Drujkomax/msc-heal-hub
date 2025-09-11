-- Remove the conflicting anonymous block policy for leads
DROP POLICY IF EXISTS "Block anonymous lead access" ON public.leads;

-- Update the website lead submissions policy to also allow SELECT for the inserted row
DROP POLICY IF EXISTS "Allow website lead submissions" ON public.leads;

-- Create a comprehensive policy for website submissions that allows both INSERT and SELECT for the same operation
CREATE POLICY "Allow website lead submissions with read access" 
ON public.leads 
FOR ALL
USING (
  -- Allow SELECT for authenticated users or for website form leads
  (auth.uid() IS NOT NULL) OR 
  (source = 'website_form' AND stage = 'new')
)
WITH CHECK (
  -- Allow INSERT for authenticated users or for website form leads
  (auth.uid() IS NOT NULL) OR 
  (source = 'website_form' AND stage = 'new')
);