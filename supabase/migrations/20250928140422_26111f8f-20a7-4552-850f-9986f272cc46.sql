-- Fix employee data exposure in profiles table
-- Remove any overly permissive public policies and restrict to authenticated users only

-- Drop existing policies to replace with more secure ones
DROP POLICY IF EXISTS "Restrict profile access to authorized users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Users can insert their own profile (unchanged - secure)
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Users can update their own profile (unchanged - secure)
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- SECURITY FIX: Restrict profile viewing to authenticated users only
-- Only allow users to see their own profile OR colleagues if they are employees
CREATE POLICY "Authenticated users can view employee profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = id OR 
    has_role_level(auth.uid(), 'salesperson'::app_role)
  )
);

-- Fix site_contacts table - allow public viewing of company contact info
DROP POLICY IF EXISTS "Admins can manage site contacts" ON public.site_contacts;

-- Allow public to view company contact information
CREATE POLICY "Public can view site contacts" 
ON public.site_contacts 
FOR SELECT 
USING (true);

-- Admins can manage site contacts
CREATE POLICY "Admins can manage site contacts" 
ON public.site_contacts 
FOR ALL 
USING (has_role_level(auth.uid(), 'admin'::app_role));