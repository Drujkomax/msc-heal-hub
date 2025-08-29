-- Исправляем категорию с некорректным значением
UPDATE product_categories 
SET value = 'resuscitation_cardiology' 
WHERE value = '__' OR value = '';