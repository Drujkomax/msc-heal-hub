import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Phone, Mail, User, Building, MessageSquare, Send } from 'lucide-react';

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
      subtitle: 'Получите профессиональную консультацию по выбору медицинского оборудования',
      name: 'Ваше имя',
      email: 'Email',
      phone: 'Телефон',
      company: 'Название компании',
      position: 'Должность',
      equipmentType: 'Тип оборудования',
      budget: 'Бюджет',
      message: 'Дополнительная информация',
      preferredContact: 'Предпочтительный способ связи',
      contactPhone: 'Телефон',
      contactEmail: 'Email',
      contactWhatsApp: 'WhatsApp',
      submit: 'Отправить заявку',
      required: 'Обязательное поле',
      equipmentTypes: {
        ultrasound: 'УЗИ оборудование',
        xray: 'Рентген оборудование',
        mri: 'МРТ оборудование',
        ct: 'КТ оборудование',
        lab: 'Лабораторное оборудование',
        other: 'Другое'
      },
      budgets: {
        under50k: 'До $50,000',
        '50k-100k': '$50,000 - $100,000',
        '100k-500k': '$100,000 - $500,000',
        'over500k': 'Свыше $500,000',
        discuss: 'Обсудим индивидуально'
      }
    },
    en: {
      title: 'Consultation Form',
      subtitle: 'Get professional consultation on choosing medical equipment',
      name: 'Your name',
      email: 'Email',
      phone: 'Phone',
      company: 'Company name',
      position: 'Position',
      equipmentType: 'Equipment type',
      budget: 'Budget',
      message: 'Additional information',
      preferredContact: 'Preferred contact method',
      contactPhone: 'Phone',
      contactEmail: 'Email',
      contactWhatsApp: 'WhatsApp',
      submit: 'Submit request',
      required: 'Required field',
      equipmentTypes: {
        ultrasound: 'Ultrasound equipment',
        xray: 'X-ray equipment',
        mri: 'MRI equipment',
        ct: 'CT equipment',
        lab: 'Laboratory equipment',
        other: 'Other'
      },
      budgets: {
        under50k: 'Under $50,000',
        '50k-100k': '$50,000 - $100,000',
        '100k-500k': '$100,000 - $500,000',
        'over500k': 'Over $500,000',
        discuss: 'Discuss individually'
      }
    },
    uz: {
      title: 'Maslahat shakli',
      subtitle: 'Tibbiy asbob-uskunalarni tanlash bo\'yicha professional maslahat oling',
      name: 'Ismingiz',
      email: 'Email',
      phone: 'Telefon',
      company: 'Kompaniya nomi',
      position: 'Lavozim',
      equipmentType: 'Asbob-uskuna turi',
      budget: 'Byudjet',
      message: 'Qo\'shimcha ma\'lumot',
      preferredContact: 'Afzal aloqa usuli',
      contactPhone: 'Telefon',
      contactEmail: 'Email',
      contactWhatsApp: 'WhatsApp',
      submit: 'Ariza jo\'natish',
      required: 'Majburiy maydon',
      equipmentTypes: {
        ultrasound: 'Ultratovush asboblari',
        xray: 'Rentgen asboblari',
        mri: 'MRI asboblari',
        ct: 'KT asboblari',
        lab: 'Laboratoriya asboblari',
        other: 'Boshqa'
      },
      budgets: {
        under50k: '$50,000 gacha',
        '50k-100k': '$50,000 - $100,000',
        '100k-500k': '$100,000 - $500,000',
        'over500k': '$500,000 dan ortiq',
        discuss: 'Alohida muhokama qilamiz'
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
      // Here you would typically send the data to your backend
      console.log('Form submitted:', formData);
      
      toast({
        title: language === 'ru' ? 'Заявка отправлена!' : language === 'en' ? 'Request sent!' : 'Ariza jo\'natildi!',
        description: language === 'ru' 
          ? 'Мы свяжемся с вами в ближайшее время' 
          : language === 'en' 
          ? 'We will contact you soon' 
          : 'Tez orada siz bilan bog\'lanamiz',
      });

      // Reset form
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
    <Card className="w-full max-w-lg mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      {/* Trust elements and slogan */}
      <div className="bg-gradient-to-r from-msc-primary to-msc-accent text-white p-4 rounded-t-lg">
        <div className="text-center space-y-2">
          <h3 className="font-heading text-xl font-bold">От расчета до запуска — 14 дней</h3>
          <p className="text-sm text-white/90">Полный цикл: КП → поставка → установка → обучение</p>
        </div>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-1">
            <span>⚡</span>
            <span>Ответ в течение часа</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🛡️</span>
            <span>Лицензия Минздрава РУз</span>
          </div>
        </div>
      </div>

      <CardHeader className="text-center pb-4">
        <CardTitle className="font-heading text-xl lg:text-2xl flex items-center justify-center gap-2 text-msc-text">
          <MessageSquare className="w-5 h-5" />
          {t.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="border-msc-primary/20 focus:border-msc-accent transition-colors"
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
              className="border-msc-primary/20 focus:border-msc-accent transition-colors"
              placeholder="+998 XX XXX XX XX"
            />
          </div>

          {/* Equipment Type */}
          <div className="space-y-2">
            <Label className="text-msc-text font-medium">{t.equipmentType} *</Label>
            <Select value={formData.equipmentType} onValueChange={(value) => handleInputChange('equipmentType', value)} required>
              <SelectTrigger className="border-msc-primary/20 focus:border-msc-accent">
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
            className="w-full bg-gradient-to-r from-msc-primary to-msc-accent hover:from-msc-primary/90 hover:to-msc-accent/90 text-white font-semibold py-6 text-lg transition-all duration-300 shadow-lg mt-6"
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
      </CardContent>
    </Card>
  );
};

export default ConsultationForm;