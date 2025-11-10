-- Таблица для логов взаимодействия с клиентами
CREATE TABLE IF NOT EXISTS public.client_interaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('note', 'call', 'meeting', 'email', 'telegram', 'other')),
  subject TEXT,
  message TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_client_interaction_logs_client_id ON public.client_interaction_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_client_interaction_logs_created_at ON public.client_interaction_logs(created_at DESC);

-- RLS политики
ALTER TABLE public.client_interaction_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view interaction logs"
  ON public.client_interaction_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create interaction logs"
  ON public.client_interaction_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Добавляем поле telegram_chat_id в таблицу clients если его нет
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'telegram_chat_id'
  ) THEN
    ALTER TABLE public.clients ADD COLUMN telegram_chat_id TEXT;
  END IF;
END $$;