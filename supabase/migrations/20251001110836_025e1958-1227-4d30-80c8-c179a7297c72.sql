-- Add 'observer' role to app_role enum
-- This must be done in a separate transaction
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'observer' 
    AND enumtypid = 'app_role'::regtype
  ) THEN
    EXECUTE 'ALTER TYPE app_role ADD VALUE ''observer''';
  END IF;
END $$;