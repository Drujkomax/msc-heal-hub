-- Add contact_inquiries table
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous contact form submissions" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Admins can view all contact inquiries" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Admins can update contact inquiries" ON public.contact_inquiries;

-- Allow anonymous users to insert contact inquiries
CREATE POLICY "Allow anonymous contact form submissions" 
ON public.contact_inquiries 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Allow authenticated admin users to view all contact inquiries
CREATE POLICY "Admins can view all contact inquiries" 
ON public.contact_inquiries 
FOR SELECT 
USING (has_role_level(auth.uid(), 'admin'::app_role));

-- Allow authenticated admin users to update contact inquiries
CREATE POLICY "Admins can update contact inquiries" 
ON public.contact_inquiries 
FOR UPDATE 
USING (has_role_level(auth.uid(), 'admin'::app_role));

-- Create or replace trigger function for updating updated_at column
CREATE OR REPLACE FUNCTION public.update_contact_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_contact_inquiries_updated_at ON public.contact_inquiries;
CREATE TRIGGER update_contact_inquiries_updated_at
  BEFORE UPDATE ON public.contact_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contact_inquiries_updated_at();