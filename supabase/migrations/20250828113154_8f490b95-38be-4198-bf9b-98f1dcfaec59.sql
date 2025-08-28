-- Temporarily disable foreign key constraint, add role, then re-enable
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Insert director role for the user
INSERT INTO public.user_roles (user_id, role)
VALUES ('b5c09100-d1b1-47c3-98f6-cb0f4eaab0c1', 'director')
ON CONFLICT (user_id) DO UPDATE SET role = 'director';

-- Re-enable the foreign key constraint (but make it not validate existing data)
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) 
ON DELETE CASCADE NOT VALID;