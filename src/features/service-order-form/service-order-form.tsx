"use client";

// Заказ услуги со страницы /services. До редизайна это была заглушка:
// поля не собирались, сабмит показывал toast и закрывал диалог. Теперь
// заявка уходит в CRM (leads, source=website_form) и мгновенно в Telegram.
import React, { useEffect, useRef, useState } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { formatUzbekPhoneNumber, validateUzbekPhoneNumber, getFullUzbekPhoneNumber, isValidUzbekPhoneLength, isCompleteUzbekPhone } from '@/lib/phoneValidation';
import { validateName, sanitizeInput } from '@/lib/formValidation';
import { Check, Send, Wrench, X } from 'lucide-react';
import { useT, useLang } from '~/shared/i18n/i18n-provider';

const TELEGRAM_CHANNEL_URL = 'https://t.me/medsc_uz';

const FIELD =
  'h-11 w-full rounded-xl border bg-white px-4 text-[15px] text-msc-text placeholder:text-msc-text-light/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563eb]/25 focus:border-[#2563eb]';
const FIELD_OK = 'border-msc-primary/15 hover:border-msc-primary/30';
const FIELD_ERR = 'border-red-400';
const LABEL = 'mb-1.5 block text-sm font-medium text-msc-primary';
const ERROR_TEXT = 'mt-1.5 text-xs text-red-600 animate-in slide-in-from-top-1 duration-200 motion-reduce:animate-none';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const TEXTS = {
  ru: {
    title: 'Заказать услугу',
    promise: 'Ответим в течение рабочего дня',
    service: 'Услуга',
    name: 'Имя',
    phone: 'Телефон',
    email: 'Email',
    company: 'Организация / клиника',
    message: 'Комментарий',
    messagePlaceholder: 'Опишите задачу: оборудование, сроки, адрес…',
    submit: 'Отправить заявку',
    sending: 'Отправка...',
    submitError: 'Не удалось отправить заявку. Попробуйте ещё раз.',
    emailInvalid: 'Неверный формат email',
    successTitle: 'Заявка отправлена!',
    successDescription: 'Мы свяжемся с вами в течение рабочего дня.',
    successTelegram: 'Пока ждёте — наш Telegram-канал',
    close: 'Закрыть',
  },
  en: {
    title: 'Order a Service',
    promise: "We'll respond within one business day",
    service: 'Service',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    company: 'Organization / clinic',
    message: 'Comment',
    messagePlaceholder: 'Describe the task: equipment, timeline, address…',
    submit: 'Send request',
    sending: 'Sending...',
    submitError: 'Failed to send the request. Please try again.',
    emailInvalid: 'Invalid email format',
    successTitle: 'Request sent!',
    successDescription: "We'll contact you within one business day.",
    successTelegram: 'While you wait — our Telegram channel',
    close: 'Close',
  },
  uz: {
    title: 'Xizmat buyurtma qilish',
    promise: 'Ish kuni davomida javob beramiz',
    service: 'Xizmat',
    name: 'Ism',
    phone: 'Telefon',
    email: 'Email',
    company: 'Tashkilot / klinika',
    message: 'Izoh',
    messagePlaceholder: 'Vazifani yozing: uskuna, muddat, manzil…',
    submit: "So'rov yuborish",
    sending: 'Yuborilmoqda...',
    submitError: "So'rovni yuborib bo'lmadi. Qaytadan urinib ko'ring.",
    emailInvalid: "Noto'g'ri email formati",
    successTitle: "So'rov yuborildi!",
    successDescription: 'Ish kuni davomida siz bilan bog\'lanamiz.',
    successTelegram: 'Kutish davomida — bizning Telegram kanalimiz',
    close: 'Yopish',
  },
} as const;

export function ServiceOrderForm({ serviceName, onClose }: { serviceName: string; onClose: () => void }) {
  const { addLead } = useLeads({ autoFetch: false });
  const tr = useT(); // i18n-ключи ошибок из formValidation
  const language = (useLang() || 'ru') as keyof typeof TEXTS;
  const t = TEXTS[language] ?? TEXTS.ru;

  const [formData, setFormData] = useState({ name: '', phone: '', email: '', company: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    nameRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const setField = (field: string, value: string) => {
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));

    if (field === 'phone') {
      if (!isValidUzbekPhoneLength(value)) return;
      const formatted = formatUzbekPhoneNumber(value);
      setFormData(prev => ({ ...prev, phone: formatted }));
      if (formatted.length > 0 && !isCompleteUzbekPhone(formatted)) {
        setErrors(prev => ({ ...prev, phone: 'leadForm.validation.phoneIncomplete' }));
      }
    } else if (field === 'message') {
      // eslint-disable-next-line no-control-regex
      setFormData(prev => ({ ...prev, message: value.replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '').substring(0, 500) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: sanitizeInput(value) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(false);

    const name = formData.name.trim().replace(/\s+/g, ' ');
    const email = formData.email.trim();
    const next: Record<string, string> = {};

    const nameError = validateName(name);
    if (nameError) next.name = nameError;
    if (!formData.phone.trim()) next.phone = 'leadForm.validation.phoneRequired';
    else if (!isCompleteUzbekPhone(formData.phone) || !validateUzbekPhoneNumber(formData.phone)) {
      next.phone = 'leadForm.validation.phoneInvalid';
    }
    if (email && !EMAIL_RE.test(email)) next.email = 'leadForm.validation.emailInvalid';

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setIsSubmitting(true);
    try {
      let notes = `Заказ услуги: ${serviceName}`;
      if (formData.message.trim()) notes += ` | Комментарий: ${formData.message.trim()}`;

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
    } catch {
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const errText = (key: string) => tr(key);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-msc-primary/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-order-title"
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
          <div className="px-7 py-10 text-center sm:px-9">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#2563eb]/15 bg-gradient-to-br from-[#f3f7fe] to-[#eaf0fd]">
              <Check className="h-7 w-7 text-[#2563eb]" />
            </div>
            <h2 id="service-order-title" className="mt-5 font-display text-2xl font-semibold text-msc-primary">
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
          <div className="px-7 pb-7 pt-8 sm:px-9 sm:pb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2563eb]/15 bg-gradient-to-r from-[#f3f7fe] to-[#eaf0fd] py-1.5 pl-3 pr-3.5 text-xs font-medium text-msc-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2563eb] opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2563eb]" />
              </span>
              {t.promise}
            </div>

            <h2 id="service-order-title" className="mt-4 pr-8 font-display text-[24px] font-semibold leading-tight text-msc-primary">
              {t.title}
            </h2>
            {/* Выбранная услуга — контекст, а не поле ввода */}
            <p className="mt-2 inline-flex items-center gap-2 rounded-xl bg-msc-primary/[0.05] px-3.5 py-2 text-sm font-medium text-msc-primary">
              <Wrench className="h-4 w-4 shrink-0 text-[#2563eb]" />
              {serviceName}
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
              <div>
                <label htmlFor="so-name" className={LABEL}>
                  {t.name} <span className="text-[#2563eb]">*</span>
                </label>
                <input
                  id="so-name"
                  ref={nameRef}
                  value={formData.name}
                  onChange={e => setField('name', e.target.value)}
                  placeholder={t.name}
                  autoComplete="name"
                  className={`${FIELD} ${errors.name ? FIELD_ERR : FIELD_OK}`}
                />
                {errors.name && <p className={ERROR_TEXT}>{errText(errors.name)}</p>}
              </div>

              <div>
                <label htmlFor="so-phone" className={LABEL}>
                  {t.phone} <span className="text-[#2563eb]">*</span>
                </label>
                <input
                  id="so-phone"
                  type="tel"
                  inputMode="tel"
                  value={formData.phone}
                  onChange={e => setField('phone', e.target.value)}
                  placeholder="+998 90 123 45 67"
                  maxLength={16}
                  autoComplete="tel"
                  className={`${FIELD} ${errors.phone ? FIELD_ERR : FIELD_OK}`}
                />
                {errors.phone && <p className={ERROR_TEXT}>{errText(errors.phone)}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="so-email" className={LABEL}>{t.email}</label>
                  <input
                    id="so-email"
                    type="email"
                    value={formData.email}
                    onChange={e => setField('email', e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`${FIELD} ${errors.email ? FIELD_ERR : FIELD_OK}`}
                  />
                  {errors.email && <p className={ERROR_TEXT}>{errText(errors.email)}</p>}
                </div>
                <div>
                  <label htmlFor="so-company" className={LABEL}>{t.company}</label>
                  <input
                    id="so-company"
                    value={formData.company}
                    onChange={e => setField('company', e.target.value)}
                    placeholder={t.company}
                    autoComplete="organization"
                    className={`${FIELD} ${FIELD_OK}`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="so-message" className={LABEL}>{t.message}</label>
                <textarea
                  id="so-message"
                  value={formData.message}
                  onChange={e => setField('message', e.target.value)}
                  placeholder={t.messagePlaceholder}
                  rows={3}
                  className={`${FIELD} h-auto min-h-[80px] resize-none py-3 ${FIELD_OK}`}
                />
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
}
