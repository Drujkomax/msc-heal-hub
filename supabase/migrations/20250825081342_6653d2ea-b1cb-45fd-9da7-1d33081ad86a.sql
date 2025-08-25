-- First migration: Add new enum values
ALTER TYPE app_role ADD VALUE 'director';
ALTER TYPE app_role ADD VALUE 'sales_manager';
ALTER TYPE app_role ADD VALUE 'salesperson';