-- Исправляем политики доступа к продуктам
-- Удаляем ограничительные политики
DROP POLICY IF EXISTS "Anonymous product access" ON public.products;
DROP POLICY IF EXISTS "Authenticated product access" ON public.products;

-- Восстанавливаем публичный доступ к каталогу продуктов
-- Все могут видеть активные неархивированные продукты (для публичного каталога)
CREATE POLICY "Public catalog access"
ON public.products
FOR SELECT
USING (status = 'active' AND NOT archived);

-- Менеджеры могут управлять всеми продуктами (админская панель)
-- Эта политика уже существует: "Managers can manage products"

-- Удаляем ненужную функцию публичного доступа
DROP FUNCTION IF EXISTS public.get_public_products();