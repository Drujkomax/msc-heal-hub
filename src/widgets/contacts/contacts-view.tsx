"use client";

import { Mail, MapPin, Facebook, Instagram, Youtube, Check, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import LocationMap from '@/components/common/LocationMap';
import { formatUzbekPhoneNumber, validateUzbekPhoneNumber, isValidUzbekPhoneLength, isCompleteUzbekPhone, getFullUzbekPhoneNumber } from '@/lib/phoneValidation';
import { validateName, sanitizeInput } from '@/lib/formValidation';
import { useLang, useT } from '~/shared/i18n/i18n-provider';

const FIELD =
  'h-11 w-full rounded-xl border bg-white px-4 text-[15px] text-msc-text placeholder:text-msc-text-light/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563eb]/25 focus:border-[#2563eb]';
const FIELD_OK = 'border-msc-primary/15 hover:border-msc-primary/30';
const FIELD_ERR = 'border-red-400';
const FORM_LABEL = 'mb-1.5 block text-sm font-medium text-msc-primary';
const ERROR_TEXT = 'mt-1.5 text-xs text-red-600 animate-in slide-in-from-top-1 duration-200 motion-reduce:animate-none';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Фирменные иконки Telegram/WhatsApp (в lucide брендов нет — там стоял
// generic-пузырь). Глифы — круглые лого с вырезанным символом, поэтому
// заливка цветом даёт тот же вид «круг + белый символ», что у остальных карточек.
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export function ContactsView({ siteContacts }: { siteContacts: any }) {
  const language = (useLang() as 'ru' | 'en' | 'uz') || 'ru';
  const tr = useT(); // i18n-ключи ошибок из formValidation

  // Contact data, seeded from the server-fetched site_contacts row (falls back to defaults).
  const contactData = {
    phone: siteContacts?.phone || '',
    email: siteContacts?.email || 'kamilov.tolib@medsc.uz',
    address: siteContacts?.address || '',
    telegram: siteContacts?.telegram || '@medsc_uz',
    whatsapp: siteContacts?.whatsapp || '+998 90 944 34 82',
    facebook: siteContacts?.facebook || 'https://www.facebook.com/profile.php?id=61576982724139',
    instagram: siteContacts?.instagram || 'https://www.instagram.com/medservicecentreuz/',
    youtube: siteContacts?.youtube || 'https://www.youtube.com/@MedService_centre/shorts'
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const addressTranslations = {
    ru: 'Узбекистан, Ташкент, ул. Асака, 32',
    en: 'Uzbekistan, Tashkent, Asaka St., 32',
    uz: 'O\'zbekiston, Toshkent, Asaka ko\'chasi, 32'
  };

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
      messagePlaceholder: 'Ваше сообщение...',
      send: 'Отправить',
      sending: 'Отправка...',
      submitError: 'Не удалось отправить сообщение. Попробуйте ещё раз.',
      successTitle: 'Сообщение отправлено!',
      successText: 'Мы свяжемся с вами в ближайшее время.',
      sendAnother: 'Отправить ещё',
      fullAddress: 'Узбекистан, Ташкент, ул. Асака, 32',
      ourLocation: 'Наше местоположение',
      locationDescription: 'Найдите нас на карте'
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
      messagePlaceholder: 'Your message...',
      send: 'Send',
      sending: 'Sending...',
      submitError: 'Failed to send the message. Please try again.',
      successTitle: 'Message sent!',
      successText: "We'll contact you shortly.",
      sendAnother: 'Send another',
      fullAddress: 'Uzbekistan, Tashkent, Asaka St., 32',
      ourLocation: 'Our Location',
      locationDescription: 'Find us on the map'
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
      messagePlaceholder: 'Sizning xabaringiz...',
      send: 'Yuborish',
      sending: 'Yuborilmoqda...',
      submitError: "Xabarni yuborib bo'lmadi. Qaytadan urinib ko'ring.",
      successTitle: 'Xabar yuborildi!',
      successText: 'Tez orada siz bilan bog\'lanamiz.',
      sendAnother: 'Yana yuborish',
      fullAddress: 'O\'zbekiston, Toshkent, Asaka ko\'chasi, 32',
      ourLocation: 'Bizning joylashuvimiz',
      locationDescription: 'Bizni xaritada toping'
    }
  };

  const currentContent = content[language] || content['ru'];

  const handleEmailClick = () => {
    window.open(`mailto:${contactData.email}`, '_self');
  };

  const handleTelegramClick = () => {
    const telegramUrl = contactData.telegram.startsWith('http')
      ? contactData.telegram
      : `https://t.me/${contactData.telegram.replace('@', '')}`;
    window.open(telegramUrl, '_blank');
  };

  const handleWhatsAppClick = () => {
    const whatsappNumber = contactData.whatsapp.replace(/[^\d]/g, '');
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  };

  const handleFacebookClick = () => {
    window.open(contactData.facebook, '_blank');
  };

  const handleInstagramClick = () => {
    window.open(contactData.instagram, '_blank');
  };

  const handleYouTubeClick = () => {
    window.open(contactData.youtube, '_blank');
  };

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'phone') {
      if (!isValidUzbekPhoneLength(value)) return;
      const formatted = formatUzbekPhoneNumber(value);
      setFormData(prev => ({ ...prev, phone: formatted }));
      if (formatted.length > 0 && !isCompleteUzbekPhone(formatted)) {
        setFormErrors(prev => ({ ...prev, phone: 'leadForm.validation.phoneIncomplete' }));
      }
    } else if (name === 'message') {
      // eslint-disable-next-line no-control-regex
      setFormData(prev => ({ ...prev, message: value.replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '').substring(0, 500) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: sanitizeInput(value) }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(false);

    const name = formData.name.trim().replace(/\s+/g, ' ');
    const email = formData.email.trim();
    const message = formData.message.trim();
    const next: Record<string, string> = {};

    const nameError = validateName(name);
    if (nameError) next.name = nameError;
    if (!formData.phone.trim()) next.phone = 'leadForm.validation.phoneRequired';
    else if (!isCompleteUzbekPhone(formData.phone) || !validateUzbekPhoneNumber(formData.phone)) {
      next.phone = 'leadForm.validation.phoneInvalid';
    }
    if (email && !EMAIL_RE.test(email)) next.email = 'leadForm.validation.emailInvalid';
    if (!message) next.message = 'leadForm.validation.messageRequired';

    if (Object.keys(next).length) {
      setFormErrors(next);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('contact_inquiries' as any)
        .insert({
          name,
          phone: getFullUzbekPhoneNumber(formData.phone),
          email: email || null,
          message
        });

      if (error) throw error;
      setIsSent(true);
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            {currentContent.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {currentContent.subtitle}
          </p>
        </div>

        {/* Contact Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {/* Email */}
          <Card
            role="button"
            tabIndex={0}
            aria-label="Написать на email"
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleEmailClick(); } }}
            className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={handleEmailClick}
          >
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-msc-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-2">{currentContent.email}</h3>
              <p className="text-msc-primary text-lg font-medium">{contactData.email}</p>
            </CardContent>
          </Card>

          {/* Address */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-msc-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-2">{currentContent.address}</h3>
              <p className="text-muted-foreground text-lg">{addressTranslations[language] || addressTranslations.ru}</p>
            </CardContent>
          </Card>

          {/* Telegram */}
          <Card
            role="button"
            tabIndex={0}
            aria-label="Открыть Telegram"
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleTelegramClick(); } }}
            className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={handleTelegramClick}
          >
            <CardContent className="p-8 text-center">
              <TelegramIcon className="mx-auto mb-4 h-16 w-16 text-msc-primary" />
              <h3 className="font-semibold text-xl text-foreground mb-2">Telegram</h3>
              <p className="text-msc-primary text-lg font-medium">{contactData.telegram}</p>
            </CardContent>
          </Card>

          {/* WhatsApp */}
          <Card
            role="button"
            tabIndex={0}
            aria-label="Открыть WhatsApp"
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleWhatsAppClick(); } }}
            className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={handleWhatsAppClick}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-msc-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <WhatsAppIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-2">WhatsApp</h3>
              <p className="text-msc-primary text-lg font-medium">{contactData.whatsapp}</p>
            </CardContent>
          </Card>

          {/* Working Hours */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-msc-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-white rounded text-msc-primary font-bold flex items-center justify-center text-xs">
                  9-6
                </div>
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-2">{currentContent.workingHours}</h3>
              <div className="space-y-1">
                <p className="text-muted-foreground">{currentContent.workingHoursText}</p>
                <p className="text-muted-foreground text-sm">{currentContent.weekend}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Social Networks Row */}
        <div className="mb-16">
          <h3 className="font-semibold text-2xl text-foreground text-center mb-8">{currentContent.socialNetworks}</h3>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            <Button
              variant="outline"
              size="lg"
              className="h-12 justify-center space-x-2 text-base px-6"
              onClick={handleFacebookClick}
            >
              <Facebook className="w-4 h-4" />
              <span>Facebook</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 justify-center space-x-2 text-base px-6"
              onClick={handleInstagramClick}
            >
              <Instagram className="w-4 h-4" />
              <span>Instagram</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 justify-center space-x-2 text-base px-6"
              onClick={handleYouTubeClick}
            >
              <Youtube className="w-4 h-4" />
              <span>YouTube</span>
            </Button>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <div className="rounded-3xl border border-msc-primary/10 bg-white px-7 py-9 shadow-[0_30px_80px_-45px_rgba(12,17,57,0.4)] sm:px-10">
            {isSent ? (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#2563eb]/15 bg-gradient-to-br from-[#f3f7fe] to-[#eaf0fd]">
                  <Check className="h-7 w-7 text-[#2563eb]" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold text-msc-primary">
                  {currentContent.successTitle}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-msc-text-light">
                  {currentContent.successText}
                </p>
                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className="mt-7 inline-flex items-center justify-center rounded-xl border border-msc-primary/20 bg-white px-6 py-3 text-sm font-semibold text-msc-primary transition-colors hover:border-msc-primary/40 hover:bg-msc-primary/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msc-primary/40"
                >
                  {currentContent.sendAnother}
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h3 className="font-display text-3xl font-semibold text-msc-primary mb-2">{currentContent.contactForm}</h3>
                  <p className="text-msc-text-light">{currentContent.formDescription}</p>
                </div>

                <form className="space-y-4" onSubmit={handleFormSubmit} noValidate>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="cv-name" className={FORM_LABEL}>
                        {currentContent.name} <span className="text-[#2563eb]">*</span>
                      </label>
                      <input
                        id="cv-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={currentContent.name}
                        autoComplete="name"
                        className={`${FIELD} ${formErrors.name ? FIELD_ERR : FIELD_OK}`}
                      />
                      {formErrors.name && <p className={ERROR_TEXT}>{tr(formErrors.name)}</p>}
                    </div>

                    <div>
                      <label htmlFor="cv-phone" className={FORM_LABEL}>
                        {currentContent.phoneField} <span className="text-[#2563eb]">*</span>
                      </label>
                      <input
                        id="cv-phone"
                        type="tel"
                        inputMode="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+998 90 123 45 67"
                        maxLength={16}
                        autoComplete="tel"
                        className={`${FIELD} ${formErrors.phone ? FIELD_ERR : FIELD_OK}`}
                      />
                      {formErrors.phone && <p className={ERROR_TEXT}>{tr(formErrors.phone)}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="cv-email" className={FORM_LABEL}>
                      {currentContent.emailField}
                    </label>
                    <input
                      id="cv-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={`${FIELD} ${formErrors.email ? FIELD_ERR : FIELD_OK}`}
                    />
                    {formErrors.email && <p className={ERROR_TEXT}>{tr(formErrors.email)}</p>}
                  </div>

                  <div>
                    <label htmlFor="cv-message" className={FORM_LABEL}>
                      {currentContent.message} <span className="text-[#2563eb]">*</span>
                    </label>
                    <textarea
                      id="cv-message"
                      rows={5}
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={currentContent.messagePlaceholder}
                      className={`${FIELD} h-auto min-h-[120px] resize-none py-3 ${formErrors.message ? FIELD_ERR : FIELD_OK}`}
                    />
                    {formErrors.message && <p className={ERROR_TEXT}>{tr(formErrors.message)}</p>}
                  </div>

                  {submitError && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {currentContent.submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="!mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-msc-primary px-7 py-3.5 text-base font-semibold text-white shadow-[0_12px_32px_-14px_rgba(12,17,57,0.5)] transition-colors hover:bg-msc-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msc-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none" />
                        {currentContent.sending}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {currentContent.send}
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Location Map */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="text-center mb-8">
            <h3 className="font-semibold text-3xl text-foreground mb-2">{currentContent.ourLocation}</h3>
            <p className="text-muted-foreground text-lg">{currentContent.locationDescription}</p>
          </div>
          <LocationMap />
        </div>
      </div>
    </div>
  );
}
