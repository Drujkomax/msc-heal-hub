-- Add the constraint back with the correct values
ALTER TABLE leads ADD CONSTRAINT leads_stage_check 
CHECK (stage = ANY (ARRAY['new'::text, 'contacted'::text, 'qualified'::text, 'proposal'::text, 'negotiation'::text, 'closed'::text, 'lost'::text]));