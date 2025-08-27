-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_contact TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS for clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create deals table
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  amount NUMERIC,
  stage TEXT NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'closed', 'lost')),
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  close_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS for deals
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES auth.users(id),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY "Users can view their team's clients" ON public.clients
  FOR SELECT USING (
    has_role_level(auth.uid(), 'salesperson')
  );

CREATE POLICY "Users can create clients" ON public.clients
  FOR INSERT WITH CHECK (
    has_role_level(auth.uid(), 'salesperson') AND auth.uid() = created_by
  );

CREATE POLICY "Users can update their team's clients" ON public.clients
  FOR UPDATE USING (
    has_role_level(auth.uid(), 'salesperson')
  );

CREATE POLICY "Admins can delete clients" ON public.clients
  FOR DELETE USING (
    has_role_level(auth.uid(), 'admin')
  );

-- RLS Policies for deals
CREATE POLICY "Users can view their team's deals" ON public.deals
  FOR SELECT USING (
    has_role_level(auth.uid(), 'salesperson')
  );

CREATE POLICY "Users can create deals" ON public.deals
  FOR INSERT WITH CHECK (
    has_role_level(auth.uid(), 'salesperson') AND auth.uid() = created_by
  );

CREATE POLICY "Users can update their team's deals" ON public.deals
  FOR UPDATE USING (
    has_role_level(auth.uid(), 'salesperson')
  );

CREATE POLICY "Admins can delete deals" ON public.deals
  FOR DELETE USING (
    has_role_level(auth.uid(), 'admin')
  );

-- RLS Policies for tasks
CREATE POLICY "Users can view their assigned tasks" ON public.tasks
  FOR SELECT USING (
    assignee_id = auth.uid() OR has_role_level(auth.uid(), 'sales_manager')
  );

CREATE POLICY "Users can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (
    has_role_level(auth.uid(), 'salesperson') AND auth.uid() = created_by
  );

CREATE POLICY "Users can update their tasks" ON public.tasks
  FOR UPDATE USING (
    assignee_id = auth.uid() OR has_role_level(auth.uid(), 'sales_manager')
  );

CREATE POLICY "Admins can delete tasks" ON public.tasks
  FOR DELETE USING (
    has_role_level(auth.uid(), 'admin')
  );

-- Create triggers for updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();