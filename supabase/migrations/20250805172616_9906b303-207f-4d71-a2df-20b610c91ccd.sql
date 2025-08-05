-- Обновляем роль пользователя на admin
UPDATE user_roles 
SET role = 'admin'::app_role 
WHERE user_id = '5dd0bf9d-adc0-488e-9efa-bbe57b5bb80e';