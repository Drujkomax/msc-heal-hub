-- Insert a new MRI product
INSERT INTO public.products (
  name,
  description,
  category,
  features,
  images,
  country,
  status,
  in_stock
) VALUES (
  '{"ru": "МРТ Philips Achieva 3.0T", "en": "MRI Philips Achieva 3.0T", "uz": "MRT Philips Achieva 3.0T"}',
  '{"ru": "Высокопольный МРТ сканер с напряженностью магнитного поля 3.0 Тесла для максимальной детализации изображений", "en": "High-field MRI scanner with 3.0 Tesla magnetic field strength for maximum image detail", "uz": "Maksimal tasvirlar uchun 3.0 Tesla magnit maydoni kuchiga ega yuqori maydonli MRT skaneri"}',
  'diagnostic',
  '{"ru": ["Магнитное поле 3.0 Тесла", "Высокая скорость сканирования", "Улучшенное качество изображения", "Низкий уровень шума", "Автоматическая калибровка"], "en": ["3.0 Tesla magnetic field", "High scanning speed", "Enhanced image quality", "Low noise level", "Automatic calibration"], "uz": ["3.0 Tesla magnit maydoni", "Yuqori skanerlash tezligi", "Yaxshilangan tasvir sifati", "Past shovqin darajasi", "Avtomatik kalibrlash"]}',
  '{"cover": "/assets/equipment-mri-1080x1350.jpg", "gallery": []}',
  'Netherlands',
  'active',
  true
);