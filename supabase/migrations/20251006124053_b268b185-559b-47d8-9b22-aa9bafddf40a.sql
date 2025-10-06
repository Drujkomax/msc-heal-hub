-- Обновляем RLS политику для обновления сделок, чтобы бухгалтеры могли обновлять сделки
DROP POLICY IF EXISTS "Users can update their team's deals" ON public.deals;

CREATE POLICY "Users can update their team's deals"
ON public.deals
FOR UPDATE
USING (
  has_role_level(auth.uid(), 'salesperson'::app_role) OR
  has_role(auth.uid(), 'accountant'::app_role)
)
WITH CHECK (
  has_role_level(auth.uid(), 'salesperson'::app_role) OR
  has_role(auth.uid(), 'accountant'::app_role)
);