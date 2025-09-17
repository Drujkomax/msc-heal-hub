-- Create categories table for product organization
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  name JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (true);

-- Only authenticated users can manage categories
CREATE POLICY "Authenticated users can manage categories" 
ON public.categories 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (value, name) VALUES
('diagnostic', '{"ru": "Диагностическое оборудование", "en": "Diagnostic Equipment", "uz": "Diagnostika uskunalari"}'),
('surgical', '{"ru": "Хирургическое оборудование", "en": "Surgical Equipment", "uz": "Jarrohlik uskunalari"}'),
('laboratory', '{"ru": "Лабораторное оборудование", "en": "Laboratory Equipment", "uz": "Laboratoriya uskunalari"}'),
('rehabilitation', '{"ru": "Реабилитационное оборудование", "en": "Rehabilitation Equipment", "uz": "Reabilitatsiya uskunalari"}'),
('furniture', '{"ru": "Медицинская мебель", "en": "Medical Furniture", "uz": "Tibbiy mebel"}'),
('imaging', '{"ru": "Медицинская визуализация", "en": "Medical Imaging", "uz": "Tibbiy tasvirlash"}');