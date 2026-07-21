import React, { useEffect, useRef, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeads } from '@/hooks/useLeads';
import { supabase } from '@/integrations/supabase/client';
import { formatUzbekPhoneNumber, validateUzbekPhoneNumber, getFullUzbekPhoneNumber, isValidUzbekPhoneLength, isCompleteUzbekPhone } from '@/lib/phoneValidation';
import { validateLeadForm, sanitizeInput } from '@/lib/formValidation';
import { Check, Send, X } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { useT } from '~/shared/i18n/i18n-provider';

const TELEGRAM_CHANNEL_URL = 'https://t.me/medsc_uz';

const FIELD =
  'h-11 w-full rounded-xl border bg-white px-4 text-[15px] text-msc-text placeholder:text-msc-text-light/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563eb]/25 focus:border-[#2563eb]';
const FIELD_OK = 'border-msc-primary/15 hover:border-msc-primary/30';
const FIELD_ERR = 'border-red-400';
const LABEL = 'mb-1.5 block text-sm font-medium text-msc-primary';
const ERROR_TEXT = 'mt-1.5 text-xs text-red-600 animate-in slide-in-from-top-1 duration-200 motion-reduce:animate-none';

interface QuoteRequestFormProps {
  language: 'ru' | 'en' | 'uz';
  product?: Product;
  onClose?: () => void;
}

const QuoteRequestForm: React.FC<QuoteRequestFormProps> = ({
  language,
  product,
  onClose
}) => {
  const { addLead } = useLeads({ autoFetch: false });
  const tr = useT(); // переводит i18n-ключи ошибок из validateLeadForm

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    message: '',
    equipmentType: product?.category || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const nameRef = useRef<HTMLInputElement>(null);

  const texts = {
    ru: {
      title: product ? `Получить КП по ${product.name.ru}` : 'Запрос коммерческого предложения',
      description: 'Детальное КП → цены → сроки → условия доставки',
      promise: 'КП в течение 24 часов',
      name: 'Ваше имя',
      phone: 'Телефон',
      email: 'Email',
      company: 'Организация / клиника',
      message: 'Дополнительные требования',
      equipmentType: 'Тип оборудования',
      submit: 'Запросить КП',
      sending: 'Отправка...',
      submitError: 'Не удалось отправить запрос. Попробуйте ещё раз.',
      messagePlaceholder: 'Укажите количество, особые требования, предпочтения по брендам и другие детали...',
      successTitle: 'Запрос КП отправлен!',
      successDescription: 'Мы подготовим КП и свяжемся с вами в течение 24 часов.',
      successTelegram: 'Пока ждёте — наш Telegram-канал',
      close: 'Закрыть',
      equipmentTypes: {
        diagnostic: 'Диагностическое',
        surgical: 'Хирургическое',
        monitoring: 'Мониторинг',
        laboratory: 'Лабораторное',
        rehabilitation: 'Реабилитационное',
        dental: 'Стоматологическое',
        ophthalmology: 'Офтальмологическое',
        furniture: 'Медицинская мебель'
      }
    },
    en: {
      title: product ? `Get Quote for ${product.name.en}` : 'Commercial Proposal Request',
      description: 'Detailed quote → prices → delivery terms → conditions',
      promise: 'Quote within 24 hours',
      name: 'Your name',
      phone: 'Phone',
      email: 'Email',
      company: 'Organization / clinic',
      message: 'Additional requirements',
      equipmentType: 'Equipment type',
      submit: 'Request Quote',
      sending: 'Sending...',
      submitError: 'Failed to send the request. Please try again.',
      messagePlaceholder: 'Specify quantity, special requirements, brand preferences and other details...',
      successTitle: 'Quote request sent!',
      successDescription: 'We will prepare a quote and contact you within 24 hours.',
      successTelegram: 'While you wait — our Telegram channel',
      close: 'Close',
      equipmentTypes: {
        diagnostic: 'Diagnostic',
        surgical: 'Surgical',
        monitoring: 'Monitoring',
        laboratory: 'Laboratory',
        rehabilitation: 'Rehabilitation',
        dental: 'Dental',
        ophthalmology: 'Ophthalmology',
        furniture: 'Medical Furniture'
      }
    },
    uz: {
      title: product ? `${product.name.uz} uchun KP olish` : 'Tijorat taklifini so\'rash',
      description: 'Batafsil taklif → narxlar → yetkazish → shartlar',
      promise: '24 soat ichida taklif',
      name: 'Ismingiz',
      phone: 'Telefon',
      email: 'Email',
      company: 'Tashkilot / klinika',
      message: 'Qo\'shimcha talablar',
      equipmentType: 'Asbob-uskuna turi',
      submit: 'Taklif so\'rash',
      sending: 'Yuborilmoqda...',
      submitError: 'So\'rovni yuborib bo\'lmadi. Qaytadan urinib ko\'ring.',
      messagePlaceholder: 'Miqdor, maxsus talablar, brend afzalliklari va boshqa tafsilotlarni ko\'rsating...',
      successTitle: 'KP so\'rovi yuborildi!',
      successDescription: '24 soat ichida KP tayyorlab, siz bilan bog\'lanamiz.',
      successTelegram: 'Kutish davomida — bizning Telegram kanalimiz',
      close: 'Yopish',
      equipmentTypes: {
        diagnostic: 'Diagnostika',
        surgical: 'Jarrohlik',
        monitoring: 'Monitoring',
        laboratory: 'Laboratoriya',
        rehabilitation: 'Reabilitatsiya',
        dental: 'Stomatologiya',
        ophthalmology: 'Oftalmologiya',
        furniture: 'Tibbiy mebel'
      }
    }
  };

  const t = texts[language];

  // Закрытие по Escape + блокировка прокрутки страницы под модалкой
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    nameRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const handleInputChange = (field: string, value: string) => {
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }

    if (field === 'phone') {
      if (!isValidUzbekPhoneLength(value)) return;

      const formatted = formatUzbekPhoneNumber(value);
      setFormData(prev => ({ ...prev, phone: formatted }));

      if (formatted.length > 0) {
        if (!isCompleteUzbekPhone(formatted)) {
          setPhoneError('leadForm.validation.phoneIncomplete');
        } else if (!validateUzbekPhoneNumber(formatted)) {
          setPhoneError('leadForm.validation.phoneInvalid');
        } else {
          setPhoneError('');
        }
      } else {
        setPhoneError('');
      }
    } else if (field === 'message') {
      // Требования могут быть длинными — лимит валидации 500, а не 200
      // eslint-disable-next-line no-control-regex
      const clean = value.replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '').substring(0, 500);
      setFormData(prev => ({ ...prev, message: clean }));
    } else {
      setFormData(prev => ({ ...prev, [field]: sanitizeInput(value) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setValidationErrors({});
    setPhoneError('');
    setSubmitError(false);

    const name = formData.name.trim().replace(/\s+/g, ' ');
    const email = formData.email.trim();
    // Набор типов оборудования у этой формы свой. Когда открыто по товару,
    // категория приходит из БД (селект скрыт) — её не валидируем, иначе
    // категории вне списка молча блокировали сабмит.
    const validation = validateLeadForm(
      { ...formData, name, equipmentType: product ? undefined : formData.equipmentType },
      { equipmentTypes: Object.keys(t.equipmentTypes) }
    );
    const errors = { ...validation.errors };
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      errors.email = 'leadForm.validation.emailInvalid';
    }
    if (Object.keys(errors).length) {
      setValidationErrors(errors);
      return;
    }

    if (!isCompleteUzbekPhone(formData.phone) || !validateUzbekPhoneNumber(formData.phone)) {
      setPhoneError('leadForm.validation.phoneInvalid');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare detailed notes for the lead
      let notes = `Запрос КП`;
      if (product) {
        notes += ` - ${product.name[language]}`;
      }
      if (formData.equipmentType) {
        notes += ` | Тип: ${t.equipmentTypes[formData.equipmentType as keyof typeof t.equipmentTypes] || formData.equipmentType}`;
      }
      if (formData.message) {
        notes += ` | Требования: ${formData.message.trim()}`;
      }

      await addLead({
        name,
        phone: getFullUzbekPhoneNumber(formData.phone),
        email: email || undefined,
        company: formData.company.trim() || undefined,
        notes,
        stage: 'new',
        source: 'website_form'
      });
      setIsSent(true);
      // счётчик «запросов КП» по товару — для конверсии в админ-дашборде
      if (product?.id) {
        supabase.rpc('increment_product_quote_requests', { product_id: product.id }).catch(() => {});
        supabase.rpc('update_conversion_analytics', {
          p_product_id: product.id,
          p_date: new Date().toISOString().slice(0, 10),
        }).catch(() => {});
      }
    } catch (error) {
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-msc-primary/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-form-title"
        onClick={e => e.stopPropagation()}
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-msc-primary/10 bg-white shadow-[0_40px_90px_-30px_rgba(12,17,57,0.5)] animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none"
      >
        <button
          onClick={onClose}
          aria-label={t.close}
          className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-msc-text-light transition-colors hover:bg-msc-primary/5 hover:text-msc-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msc-primary/40"
        >
          <X className="h-5 w-5" />
        </button>

        {isSent ? (
          /* ── Успех ─────────────────────────────────────────────── */
          <div className="px-7 py-10 text-center sm:px-9">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#2563eb]/15 bg-gradient-to-br from-[#f3f7fe] to-[#eaf0fd]">
              <Check className="h-7 w-7 text-[#2563eb]" />
            </div>
            <h2 id="quote-form-title" className="mt-5 font-display text-2xl font-semibold text-msc-primary">
              {t.successTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-msc-text-light">
              {t.successDescription}
            </p>
            <div className="mt-7 space-y-3">
              <a
                href={TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-msc-primary/20 bg-white px-6 py-3 text-sm font-semibold text-msc-primary transition-colors hover:border-msc-primary/40 hover:bg-msc-primary/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msc-primary/40"
              >
                <Send className="h-4 w-4" />
                {t.successTelegram}
              </a>
              <button
                onClick={onClose}
                className="inline-flex w-full items-center justify-center rounded-xl bg-msc-primary px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_-14px_rgba(12,17,57,0.5)] transition-colors hover:bg-msc-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msc-primary focus-visible:ring-offset-2"
              >
                {t.close}
              </button>
            </div>
          </div>
        ) : (
          /* ── Форма ─────────────────────────────────────────────── */
          <div className="px-7 pb-7 pt-8 sm:px-9 sm:pb-8">
            {/* Обещание срока вместо таймера-обратного отсчёта */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2563eb]/15 bg-gradient-to-r from-[#f3f7fe] to-[#eaf0fd] py-1.5 pl-3 pr-3.5 text-xs font-medium text-msc-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2563eb] opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2563eb]" />
              </span>
              {t.promise}
            </div>

            <h2 id="quote-form-title" className="mt-4 pr-8 font-display text-[22px] font-semibold leading-tight text-msc-primary">
              {t.title}
            </h2>
            <p className="mt-1.5 text-sm text-msc-text-light">{t.description}</p>

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              <div>
                <label htmlFor="quote-name" className={LABEL}>
                  {t.name} <span className="text-[#2563eb]">*</span>
                </label>
                <input
                  id="quote-name"
                  ref={nameRef}
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder={t.name}
                  autoComplete="name"
                  className={`${FIELD} ${validationErrors.name ? FIELD_ERR : FIELD_OK}`}
                />
                {validationErrors.name && <p className={ERROR_TEXT}>{tr(validationErrors.name)}</p>}
              </div>

              <div>
                <label htmlFor="quote-phone" className={LABEL}>
                  {t.phone} <span className="text-[#2563eb]">*</span>
                </label>
                <input
                  id="quote-phone"
                  type="tel"
                  inputMode="tel"
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  placeholder="+998 90 123 45 67"
                  maxLength={16}
                  autoComplete="tel"
                  className={`${FIELD} ${phoneError || validationErrors.phone ? FIELD_ERR : FIELD_OK}`}
                />
                {(phoneError || validationErrors.phone) && (
                  <p className={ERROR_TEXT}>{tr(phoneError || validationErrors.phone)}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="quote-email" className={LABEL}>{t.email}</label>
                  <input
                    id="quote-email"
                    type="email"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`${FIELD} ${validationErrors.email ? FIELD_ERR : FIELD_OK}`}
                  />
                  {validationErrors.email && <p className={ERROR_TEXT}>{tr(validationErrors.email)}</p>}
                </div>
                <div>
                  <label htmlFor="quote-company" className={LABEL}>{t.company}</label>
                  <input
                    id="quote-company"
                    value={formData.company}
                    onChange={e => handleInputChange('company', e.target.value)}
                    placeholder={t.company}
                    autoComplete="organization"
                    className={`${FIELD} ${FIELD_OK}`}
                  />
                </div>
              </div>

              {!product && (
                <div>
                  <label className={LABEL}>
                    {t.equipmentType}
                  </label>
                  <Select value={formData.equipmentType} onValueChange={value => handleInputChange('equipmentType', value)}>
                    <SelectTrigger
                      className={`${FIELD} data-[placeholder]:text-msc-text-light/60 ${validationErrors.equipmentType ? FIELD_ERR : FIELD_OK}`}
                    >
                      <SelectValue placeholder={t.equipmentType} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-msc-primary/10">
                      {Object.entries(t.equipmentTypes).map(([key, value]) => (
                        <SelectItem key={key} value={key} className="rounded-lg">{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.equipmentType && <p className={ERROR_TEXT}>{tr(validationErrors.equipmentType)}</p>}
                </div>
              )}

              <div>
                <label htmlFor="quote-message" className={LABEL}>
                  {t.message}
                </label>
                <textarea
                  id="quote-message"
                  value={formData.message}
                  onChange={e => handleInputChange('message', e.target.value)}
                  placeholder={t.messagePlaceholder}
                  rows={3}
                  className={`${FIELD} h-auto min-h-[88px] resize-none py-3 ${validationErrors.message ? FIELD_ERR : FIELD_OK}`}
                />
                {validationErrors.message && <p className={ERROR_TEXT}>{tr(validationErrors.message)}</p>}
              </div>

              {submitError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {t.submitError}
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
                    {t.sending}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {t.submit}
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteRequestForm;
