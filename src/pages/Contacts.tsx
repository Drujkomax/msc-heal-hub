import { Phone, Mail, MapPin, MessageCircle, Facebook, Instagram, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ContactsProps {
  language: 'ru' | 'en' | 'uz';
}

const Contacts = ({ language }: ContactsProps) => {
  const content = {
    ru: {
      title: 'Контакты',
      subtitle: 'Свяжитесь с нами любым удобным способом',
      phone: 'Телефон',
      email: 'Электронная почта',
      address: 'Адрес',
      socialNetworks: 'Социальные сети',
      workingHours: 'Часы работы',
      workingHoursText: 'Понедельник - Пятница: 9:00 - 18:00',
      weekend: 'Суббота - Воскресенье: Выходной',
      contactForm: 'Форма обратной связи',
      formDescription: 'Оставьте заявку и мы свяжемся с вами в ближайшее время',
      name: 'Имя',
      phoneField: 'Телефон',
      emailField: 'Email',
      message: 'Сообщение',
      send: 'Отправить',
      fullAddress: 'г. Ташкент, Узбекистан'
    },
    en: {
      title: 'Contacts',
      subtitle: 'Contact us in any convenient way',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      socialNetworks: 'Social Networks',
      workingHours: 'Working Hours',
      workingHoursText: 'Monday - Friday: 9:00 AM - 6:00 PM',
      weekend: 'Saturday - Sunday: Closed',
      contactForm: 'Contact Form',
      formDescription: 'Leave a request and we will contact you soon',
      name: 'Name',
      phoneField: 'Phone',
      emailField: 'Email',
      message: 'Message',
      send: 'Send',
      fullAddress: 'Tashkent, Uzbekistan'
    },
    uz: {
      title: 'Aloqa',
      subtitle: 'Biz bilan qulay usulda bog\'laning',
      phone: 'Telefon',
      email: 'Elektron pochta',
      address: 'Manzil',
      socialNetworks: 'Ijtimoiy tarmoqlar',
      workingHours: 'Ish vaqti',
      workingHoursText: 'Dushanba - Juma: 9:00 - 18:00',
      weekend: 'Shanba - Yakshanba: Dam olish kuni',
      contactForm: 'Aloqa shakli',
      formDescription: 'So\'rov qoldiring va biz tez orada siz bilan bog\'lanamiz',
      name: 'Ism',
      phoneField: 'Telefon',
      emailField: 'Email',
      message: 'Xabar',
      send: 'Yuborish',
      fullAddress: 'Toshkent, O\'zbekiston'
    }
  };

  const t = content[language];

  const handlePhoneClick = () => {
    window.open('tel:+998712373308', '_self');
  };

  const handleEmailClick = () => {
    window.open('mailto:info@medsc.uz', '_self');
  };

  const handleTelegramClick = () => {
    window.open('https://t.me/medservice_centre', '_blank');
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/998909443482', '_blank');
  };

  const handleFacebookClick = () => {
    window.open('https://www.facebook.com/profile.php?id=61576982724139', '_blank');
  };

  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/medservicecentreuz/', '_blank');
  };

  const handleYouTubeClick = () => {
    window.open('https://www.youtube.com/@MedService_centre/shorts', '_blank');
  };

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            {/* Phone */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-msc-primary rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">{t.phone}</h3>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-msc-primary hover:text-msc-accent text-lg"
                      onClick={handlePhoneClick}
                    >
                      +998 (71) 237-33-08
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-msc-primary rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">{t.email}</h3>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-msc-primary hover:text-msc-accent text-lg"
                      onClick={handleEmailClick}
                    >
                      info@medsc.uz
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-msc-primary rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">{t.address}</h3>
                    <p className="text-muted-foreground">{t.fullAddress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Working Hours */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg text-foreground mb-3">{t.workingHours}</h3>
                <div className="space-y-1">
                  <p className="text-muted-foreground">{t.workingHoursText}</p>
                  <p className="text-muted-foreground">{t.weekend}</p>
                </div>
              </CardContent>
            </Card>

            {/* Social Networks */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg text-foreground mb-4">{t.socialNetworks}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="justify-start space-x-2"
                    onClick={handleTelegramClick}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Telegram</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start space-x-2"
                    onClick={handleWhatsAppClick}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>WhatsApp</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start space-x-2"
                    onClick={handleFacebookClick}
                  >
                    <Facebook className="w-5 h-5" />
                    <span>Facebook</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start space-x-2"
                    onClick={handleInstagramClick}
                  >
                    <Instagram className="w-5 h-5" />
                    <span>Instagram</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start space-x-2 col-span-2"
                    onClick={handleYouTubeClick}
                  >
                    <Youtube className="w-5 h-5" />
                    <span>YouTube</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="sticky top-8">
              <CardContent className="p-8">
                <h3 className="font-semibold text-2xl text-foreground mb-2">{t.contactForm}</h3>
                <p className="text-muted-foreground mb-6">{t.formDescription}</p>
                
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t.name}
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-msc-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t.phoneField}
                    </label>
                    <input 
                      type="tel" 
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-msc-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t.emailField}
                    </label>
                    <input 
                      type="email" 
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-msc-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t.message}
                    </label>
                    <textarea 
                      rows={4}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-msc-primary"
                      placeholder="Ваше сообщение..."
                    ></textarea>
                  </div>
                  
                  <Button type="submit" className="w-full bg-msc-primary hover:bg-msc-accent">
                    {t.send}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;