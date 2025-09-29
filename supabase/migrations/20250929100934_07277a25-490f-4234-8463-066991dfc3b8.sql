-- Add recurrence fields to tasks table for periodic tasks
ALTER TABLE public.tasks 
ADD COLUMN recurrence_type text DEFAULT 'none' CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly', 'yearly')),
ADD COLUMN recurrence_interval integer DEFAULT 1 CHECK (recurrence_interval > 0),
ADD COLUMN recurrence_end_date timestamp with time zone,
ADD COLUMN parent_task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL;