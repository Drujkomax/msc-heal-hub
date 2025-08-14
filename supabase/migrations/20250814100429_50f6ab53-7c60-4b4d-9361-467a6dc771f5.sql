-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create products table with categories
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name JSONB NOT NULL, -- {ru: "", en: "", uz: ""}
  description JSONB NOT NULL, -- {ru: "", en: "", uz: ""}
  category TEXT NOT NULL,
  image TEXT,
  features JSONB, -- {ru: [], en: [], uz: []}
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  in_stock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for products
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage all products" 
ON public.products 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add category constraint
ALTER TABLE public.products 
ADD CONSTRAINT valid_category 
CHECK (category IN ('diagnostic', 'surgical', 'monitoring', 'laboratory', 'rehabilitation', 'dental', 'ophthalmology', 'furniture'));

-- Insert sample data
INSERT INTO public.products (name, description, category, image, features, status, in_stock) VALUES
(
  '{"ru": "Цифровой рентген-аппарат DR-X1", "en": "Digital X-Ray System DR-X1", "uz": "Raqamli rentgen apparati DR-X1"}',
  '{"ru": "Современная цифровая рентгенография с высоким разрешением", "en": "Modern digital radiography with high resolution", "uz": "Yuqori aniqlikdagi zamonaviy raqamli rentgenografiya"}',
  'diagnostic',
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
  '{"ru": ["Высокое качество изображения", "Низкая доза излучения", "Быстрая обработка"], "en": ["High image quality", "Low radiation dose", "Fast processing"], "uz": ["Yuqori surat sifati", "Past radiatsiya dozasi", "Tez ishlov berish"]}',
  'active',
  true
),
(
  '{"ru": "УЗИ-сканер ProScan 3000", "en": "Ultrasound Scanner ProScan 3000", "uz": "UZI skaneri ProScan 3000"}',
  '{"ru": "Профессиональный ультразвуковой сканер для всех видов исследований", "en": "Professional ultrasound scanner for all types of examinations", "uz": "Barcha turdagi tekshiruvlar uchun professional ultratovush skaneri"}',
  'diagnostic',
  '/assets/ultrasound-machine.jpg',
  '{"ru": ["4D визуализация", "Допплеровское исследование", "Портативность"], "en": ["4D visualization", "Doppler examination", "Portability"], "uz": ["4D vizualizatsiya", "Doppler tekshiruvi", "Ko`chma"]}',
  'active',
  true
),
(
  '{"ru": "Хирургический стол OT-2000", "en": "Surgical Table OT-2000", "uz": "Jarrohlik stoli OT-2000"}',
  '{"ru": "Многофункциональный операционный стол с электрическим приводом", "en": "Multifunctional operating table with electric drive", "uz": "Elektr haydovchili ko`p funksiyali operatsiya stoli"}',
  'surgical',
  'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=300&fit=crop',
  '{"ru": ["Электрическая регулировка", "Рентгенопрозрачность", "Простота управления"], "en": ["Electric adjustment", "Radiolucent", "Easy control"], "uz": ["Elektr sozlash", "Rentgen o`tkazuvchan", "Oson boshqarish"]}',
  'active',
  true
);