import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Phone, User, MessageSquare, Send } from 'lucide-react';
import formBackground from '@/assets/form-background.jpg';

interface ConsultationFormProps {
  language: 'ru' | 'en' | 'uz';
  onClose?: () => void;
}

const ConsultationForm: React.FC<ConsultationFormProps> = ({ language, onClose }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    equipmentType: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const texts = {
    ru: {
      title: 'Форма консультации',
      name: 'Ваше имя',
      phone: 'Телефон',
      equipmentType: 'Тип оборудования',
      submit: 'Отправить заявку',
      equipmentTypes: {
        ultrasound: 'УЗИ оборудование',
        xray: 'Рентген оборудование',
        mri: 'МРТ оборудование',
        ct: 'КТ оборудование',
        lab: 'Лабораторное оборудование',
        other: 'Другое'
      }
    },
    en: {
      title: 'Consultation Form',
      name: 'Your name',
      phone: 'Phone',
      equipmentType: 'Equipment type',
      submit: 'Submit request',
      equipmentTypes: {
        ultrasound: 'Ultrasound equipment',
        xray: 'X-ray equipment',
        mri: 'MRI equipment',
        ct: 'CT equipment',
        lab: 'Laboratory equipment',
        other: 'Other'
      }
    },
    uz: {
      title: 'Maslahat shakli',
      name: 'Ismingiz',
      phone: 'Telefon',
      equipmentType: 'Asbob-uskuna turi',
      submit: 'Ariza jo\'natish',
      equipmentTypes: {
        ultrasound: 'Ultratovush asboblari',
        xray: 'Rentgen asboblari',
        mri: 'MRI asboblari',
        ct: 'KT asboblari',
        lab: 'Laboratoriya asboblari',
        other: 'Boshqa'
      }
    }
  };

  const t = texts[language];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Form submitted:', formData);
      
      toast({
        title: language === 'ru' ? 'Заявка отправлена!' : language === 'en' ? 'Request sent!' : 'Ariza jo\'natildi!',
        description: language === 'ru' 
          ? 'Мы свяжемся с вами в ближайшее время' 
          : language === 'en' 
          ? 'We will contact you soon' 
          : 'Tez orada siz bilan bog\'lanamiz',
      });

      setFormData({
        name: '',
        phone: '',
        equipmentType: ''
      });

      if (onClose) onClose();
    } catch (error) {
      toast({
        title: language === 'ru' ? 'Ошибка!' : language === 'en' ? 'Error!' : 'Xatolik!',
        description: language === 'ru' 
          ? 'Не удалось отправить заявку' 
          : language === 'en' 
          ? 'Failed to send request' 
          : 'Arizani jo\'natib bo\'lmadi',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="relative w-full max-w-lg mx-auto min-h-screen overflow-hidden"
      style={{
        backgroundImage: `url(${formBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
      
      {/* Form Content */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen p-6">
        {/* Trust elements and slogan */}
        <div className="bg-white/95 backdrop-blur-sm text-msc-primary p-6 rounded-t-2xl shadow-xl">
          <div className="text-center space-y-3">
            <h3 className="font-heading text-xl font-bold">От расчета до запуска — 14 дней</h3>
            <p className="text-sm text-msc-text/80">Полный цикл: КП → поставка → установка → обучение</p>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm text-msc-text">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span>Ответ в течение часа</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🛡️</span>
              <span>Лицензия Минздрава РУз</span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white/95 backdrop-blur-sm rounded-b-2xl shadow-xl">
          <div className="text-center py-6 px-6 border-b border-msc-primary/10">
            <h2 className="font-heading text-2xl font-bold flex items-center justify-center gap-2 text-msc-primary">
              <MessageSquare className="w-6 h-6" />
              {t.title}
            </h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-msc-text font-medium">
                  <User className="w-4 h-4" />
                  {t.name} *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="border-msc-primary/20 focus:border-msc-accent transition-colors rounded-xl bg-white/90"
                  placeholder={t.name}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-msc-text font-medium">
                  <Phone className="w-4 h-4" />
                  {t.phone} *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  className="border-msc-primary/20 focus:border-msc-accent transition-colors rounded-xl bg-white/90"
                  placeholder="+998 XX XXX XX XX"
                />
              </div>

              {/* Equipment Type */}
              <div className="space-y-2">
                <Label className="text-msc-text font-medium">{t.equipmentType} *</Label>
                <Select value={formData.equipmentType} onValueChange={(value) => handleInputChange('equipmentType', value)} required>
                  <SelectTrigger className="border-msc-primary/20 focus:border-msc-accent rounded-xl bg-white/90">
                    <SelectValue placeholder={t.equipmentType} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(t.equipmentTypes).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-msc-primary to-msc-accent hover:from-msc-primary/90 hover:to-msc-accent/90 text-white font-semibold py-6 text-lg transition-all duration-300 shadow-lg mt-6 rounded-xl"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {language === 'ru' ? 'Отправка...' : language === 'en' ? 'Sending...' : 'Jo\'natilmoqda...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    {t.submit}
                  </div>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationForm;