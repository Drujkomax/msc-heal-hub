-- Add director role for the authenticated user
INSERT INTO public.user_roles (user_id, role)
VALUES ('b5c09100-d1b1-47c3-98f6-cb0f4eaab0c1', 'director')
ON CONFLICT (user_id) DO UPDATE SET role = 'director';