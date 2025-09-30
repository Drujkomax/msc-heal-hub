-- Remove the foreign key constraint to clients
ALTER TABLE public.deals DROP CONSTRAINT IF EXISTS deals_client_id_fkey;

-- Rename the column to be clearer about what it contains
ALTER TABLE public.deals RENAME COLUMN client_id TO lead_id;

-- Add foreign key constraint to leads table
ALTER TABLE public.deals 
ADD CONSTRAINT deals_lead_id_fkey 
FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;