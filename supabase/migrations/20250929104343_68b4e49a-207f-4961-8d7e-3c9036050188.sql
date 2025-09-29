-- Проверяем текущие значения в enum app_role
SELECT unnest(enum_range(NULL::app_role)) as role_value;

-- Добавляем новые должности в enum app_role если их еще нет
DO $$ 
BEGIN
    -- Проверяем и добавляем роль 'accountant' если её нет
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'accountant' AND enumtypid = 'app_role'::regtype) THEN
        ALTER TYPE public.app_role ADD VALUE 'accountant';
    END IF;
    
    -- Проверяем и добавляем роль 'engineer' если её нет  
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'engineer' AND enumtypid = 'app_role'::regtype) THEN
        ALTER TYPE public.app_role ADD VALUE 'engineer';
    END IF;
END $$;

-- Проверяем итоговый список ролей
SELECT unnest(enum_range(NULL::app_role)) as role_value;