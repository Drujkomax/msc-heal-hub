-- Create policy to allow anonymous users to insert leads from website forms
CREATE POLICY "Allow anonymous users to submit leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (
  source = 'website_form' AND 
  stage = 'new'
);

-- Create policy to allow anonymous users to view their own leads (if needed)
CREATE POLICY "Allow users to view leads" 
ON public.leads 
FOR SELECT 
USING (true);