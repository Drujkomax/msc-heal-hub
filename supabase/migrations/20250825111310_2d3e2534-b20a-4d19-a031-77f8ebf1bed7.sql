-- Remove constraint temporarily to allow data updates
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_stage_check;

-- Update any remaining invalid stages to valid ones  
UPDATE leads 
SET stage = CASE 
  WHEN stage = 'called' THEN 'contacted'
  WHEN stage = 'thinking' THEN 'qualified'
  WHEN stage = 'successful' THEN 'closed'
  ELSE stage
END;