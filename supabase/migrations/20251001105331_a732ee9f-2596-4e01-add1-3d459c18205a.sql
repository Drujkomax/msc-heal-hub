-- Создание таблицы для кастомных прав доступа сотрудников
CREATE TABLE public.employee_custom_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  permission_level TEXT NOT NULL CHECK (permission_level IN ('full_access', 'view_only', 'no_access')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, section)
);

-- Создание таблицы для временных сотрудников
CREATE TABLE public.temporary_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true
);

-- Функция для проверки кастомных прав доступа
CREATE OR REPLACE FUNCTION public.has_custom_permission(
  _user_id UUID,
  _section TEXT,
  _required_level TEXT DEFAULT 'view_only'
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.employee_custom_permissions ecp
    LEFT JOIN public.temporary_employees te ON te.user_id = ecp.user_id
    WHERE ecp.user_id = _user_id
      AND ecp.section = _section
      AND (
        (_required_level = 'view_only' AND ecp.permission_level IN ('view_only', 'full_access')) OR
        (_required_level = 'full_access' AND ecp.permission_level = 'full_access')
      )
      AND (te.id IS NULL OR (te.expires_at > now() AND te.is_active = true))
  )
$$;

-- Функция для проверки, является ли сотрудник временным и активным
CREATE OR REPLACE FUNCTION public.is_temporary_employee_active(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.temporary_employees
    WHERE user_id = _user_id
      AND expires_at > now()
      AND is_active = true
  )
$$;

-- RLS политики для employee_custom_permissions
ALTER TABLE public.employee_custom_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Directors can manage custom permissions"
ON public.employee_custom_permissions
FOR ALL
USING (has_role(auth.uid(), 'director'::app_role));

CREATE POLICY "Users can view their own permissions"
ON public.employee_custom_permissions
FOR SELECT
USING (auth.uid() = user_id);

-- RLS политики для temporary_employees
ALTER TABLE public.temporary_employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Directors can manage temporary employees"
ON public.temporary_employees
FOR ALL
USING (has_role(auth.uid(), 'director'::app_role));

CREATE POLICY "Users can view their own temporary status"
ON public.temporary_employees
FOR SELECT
USING (auth.uid() = user_id);

-- Триггер для обновления updated_at
CREATE TRIGGER update_employee_custom_permissions_updated_at
BEFORE UPDATE ON public.employee_custom_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Индексы для производительности
CREATE INDEX idx_employee_custom_permissions_user_id ON public.employee_custom_permissions(user_id);
CREATE INDEX idx_employee_custom_permissions_section ON public.employee_custom_permissions(section);
CREATE INDEX idx_temporary_employees_user_id ON public.temporary_employees(user_id);
CREATE INDEX idx_temporary_employees_expires_at ON public.temporary_employees(expires_at);