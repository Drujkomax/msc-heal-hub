-- Add archiving columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS archived_by uuid;

-- Create index for better performance on archived leads
CREATE INDEX IF NOT EXISTS idx_leads_archived ON public.leads(archived);
CREATE INDEX IF NOT EXISTS idx_leads_name_phone ON public.leads(name, phone);

-- Create function to archive lead
CREATE OR REPLACE FUNCTION public.archive_lead(lead_id uuid, user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.leads 
  SET 
    archived = true,
    archived_at = now(),
    archived_by = user_id
  WHERE id = lead_id;
END;
$$;