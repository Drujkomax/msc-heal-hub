-- Обновляем RLS политики для таблицы tasks с учетом новых ролей
-- Удаляем существующие политики
DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view their assigned tasks" ON public.tasks;

-- Создаем новые политики с учетом иерархии ролей

-- Политика создания задач: только директор и руководитель могут создавать
CREATE POLICY "Only directors and managers can create tasks" ON public.tasks
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'director'::app_role) OR 
  has_role(auth.uid(), 'sales_manager'::app_role)
);

-- Политика обновления: директор и руководитель могут редактировать все, остальные только статус выполнения
CREATE POLICY "Task update permissions" ON public.tasks
FOR UPDATE USING (
  -- Директор и руководитель могут редактировать все
  has_role(auth.uid(), 'director'::app_role) OR 
  has_role(auth.uid(), 'sales_manager'::app_role) OR
  -- Остальные роли (включая бухгалтера и инженера) могут только выполнять задачи
  (
    (has_role(auth.uid(), 'salesperson'::app_role) OR 
     has_role(auth.uid(), 'accountant'::app_role) OR 
     has_role(auth.uid(), 'engineer'::app_role)) AND 
    assignee_id = auth.uid()
  )
);

-- Политика просмотра: все сотрудники могут видеть задачи
CREATE POLICY "All employees can view tasks" ON public.tasks
FOR SELECT USING (
  has_role(auth.uid(), 'director'::app_role) OR
  has_role(auth.uid(), 'sales_manager'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'salesperson'::app_role) OR
  has_role(auth.uid(), 'accountant'::app_role) OR
  has_role(auth.uid(), 'engineer'::app_role) OR
  -- Или если это их назначенная задача
  assignee_id = auth.uid()
);

-- Обновляем функцию has_role_level для включения новых ролей
CREATE OR REPLACE FUNCTION public.has_role_level(_user_id uuid, _min_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND (
        (_min_role = 'user' AND ur.role IN ('user', 'accountant', 'engineer', 'salesperson', 'sales_manager', 'admin', 'director')) OR
        (_min_role = 'accountant' AND ur.role IN ('accountant', 'engineer', 'salesperson', 'sales_manager', 'admin', 'director')) OR
        (_min_role = 'engineer' AND ur.role IN ('engineer', 'salesperson', 'sales_manager', 'admin', 'director')) OR
        (_min_role = 'salesperson' AND ur.role IN ('salesperson', 'sales_manager', 'admin', 'director')) OR
        (_min_role = 'sales_manager' AND ur.role IN ('sales_manager', 'admin', 'director')) OR
        (_min_role = 'admin' AND ur.role IN ('admin', 'director')) OR
        (_min_role = 'director' AND ur.role = 'director')
      )
  )
$function$;