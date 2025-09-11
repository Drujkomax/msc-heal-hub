-- Обновляем политику для корректной работы формы лидов с сайта
DROP POLICY IF EXISTS "Allow anonymous lead submissions from website" ON public.leads;

-- Создаем новую политику, которая разрешает анонимные заявки с сайта
CREATE POLICY "Allow website lead submissions" 
ON public.leads 
FOR INSERT 
WITH CHECK (
  -- Разрешаем анонимные заявки с формы сайта
  (auth.role() = 'anon' AND source = 'website_form' AND stage = 'new') OR
  -- Разрешаем авторизованным пользователям создавать лиды любого типа
  (auth.uid() IS NOT NULL)
);