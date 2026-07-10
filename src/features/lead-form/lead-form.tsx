"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeads } from '@/hooks/useLeads';
import { formatUzbekPhoneNumber, validateUzbekPhoneNumber, getFullUzbekPhoneNumber, isValidUzbekPhoneLength, isCompleteUzbekPhone } from '@/lib/phoneValidation';
import { validateLeadForm, sanitizeInput } from '@/lib/formValidation';
import { Check, Send, X } from 'lucide-react';
import { useT } from "~/shared/i18n/i18n-provider";

const TELEGRAM_CHANNEL_URL = 'https://t.me/medsc_uz';

const FIELD =
  'h-11 w-full rounded-xl border bg-white px-4 text-[15px] text-msc-text placeholder:text-msc-text-light/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563eb]/25 focus:border-[#2563eb]';
const FIELD_OK = 'border-msc-primary/15 hover:border-msc-primary/30';
const FIELD_ERR = 'border-red-400';
const LABEL = 'mb-1.5 block text-sm font-medium text-msc-primary';
const ERROR_TEXT = 'mt-1.5 text-xs text-red-600 animate-in slide-in-from-top-1 duration-200 motion-reduce:animate-none';

export function LeadForm({ onClose }: { onClose: () => void }) {
  const { addLead } = useLeads({ autoFetch: false });
  const t = useT();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    equipmentType: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const nameRef = useRef<HTMLInputElement>(null);

  // Закрытие по Escape + блокировка прокрутки страницы под модалкой
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

  const handleInputChange = (field: string, value: string) => {
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }

    if (field === 'phone') {
      if (!isValidUzbekPhoneLength(value)) return; // не даём набрать больше 9 цифр

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
    const validation = validateLeadForm({ ...formData, name }, { requireEquipment: true });
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    if (!isCompleteUzbekPhone(formData.phone) || !validateUzbekPhoneNumber(formData.phone)) {
      setPhoneError('leadForm.validation.phoneInvalid');
      return;
    }

    setIsSubmitting(true);
    try {
      await addLead({
        name,
        phone: getFullUzbekPhoneNumber(formData.phone),
        notes: formData.equipmentType ? `Тип оборудования: ${t(`leadForm.equipmentTypes.${formData.equipmentType}`)}` : undefined,
        equipment_interest: formData.equipmentType,
        stage: 'new',
        source: 'website_form'
      });
      setIsSent(true);
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
        aria-labelledby="lead-form-title"
        onClick={e => e.stopPropagation()}
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-msc-primary/10 bg-white shadow-[0_40px_90px_-30px_rgba(12,17,57,0.5)] animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none"
      >
        <button
          onClick={onClose}
          aria-label={t('leadForm.success.close')}
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
            <h2 id="lead-form-title" className="mt-5 font-display text-2xl font-semibold text-msc-primary">
              {t('leadForm.success.title')}
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-msc-text-light">
              {t('leadForm.success.description')}
            </p>
            <div className="mt-7 space-y-3">
              <a
                href={TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-msc-primary/20 bg-white px-6 py-3 text-sm font-semibold text-msc-primary transition-colors hover:border-msc-primary/40 hover:bg-msc-primary/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msc-primary/40"
              >
                <Send className="h-4 w-4" />
                {t('leadForm.success.telegram')}
              </a>
              <button
                onClick={onClose}
                className="inline-flex w-full items-center justify-center rounded-xl bg-msc-primary px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_-14px_rgba(12,17,57,0.5)] transition-colors hover:bg-msc-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msc-primary focus-visible:ring-offset-2"
              >
                {t('leadForm.success.close')}
              </button>
            </div>
          </div>
        ) : (
          /* ── Форма ─────────────────────────────────────────────── */
          <div className="px-7 pb-7 pt-8 sm:px-9 sm:pb-8">
            {/* Обещание перезвона — то, что раньше было второй кнопкой CTA */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2563eb]/15 bg-gradient-to-r from-[#f3f7fe] to-[#eaf0fd] py-1.5 pl-3 pr-3.5 text-xs font-medium text-msc-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2563eb] opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2563eb]" />
              </span>
              {t('leadForm.callbackPromise')}
            </div>

            <h2 id="lead-form-title" className="mt-4 font-display text-[26px] font-semibold leading-tight text-msc-primary">
              {t('leadForm.title')}
            </h2>
            <p className="mt-1.5 text-sm text-msc-text-light">{t('leadForm.description')}</p>

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              <div>
                <label htmlFor="lead-name" className={LABEL}>
                  {t('leadForm.name')} <span className="text-[#2563eb]">*</span>
                </label>
                <input
                  id="lead-name"
                  ref={nameRef}
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder={t('leadForm.name')}
                  autoComplete="name"
                  className={`${FIELD} ${validationErrors.name ? FIELD_ERR : FIELD_OK}`}
                />
                {validationErrors.name && <p className={ERROR_TEXT}>{t(validationErrors.name)}</p>}
              </div>

              <div>
                <label htmlFor="lead-phone" className={LABEL}>
                  {t('leadForm.phone')} <span className="text-[#2563eb]">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center gap-2.5">
                    <span className="text-[15px] font-semibold text-msc-primary">+998</span>
                    <span className="h-4 w-px bg-msc-primary/15" />
                  </span>
                  <input
                    id="lead-phone"
                    type="tel"
                    inputMode="numeric"
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    placeholder="XX XXX XX XX"
                    maxLength={12}
                    autoComplete="tel-national"
                    className={`${FIELD} pl-[4.75rem] ${phoneError || validationErrors.phone ? FIELD_ERR : FIELD_OK}`}
                  />
                </div>
                {(phoneError || validationErrors.phone) && (
                  <p className={ERROR_TEXT}>{t(phoneError || validationErrors.phone)}</p>
                )}
              </div>

              <div>
                <label className={LABEL}>
                  {t('leadForm.equipmentType')} <span className="text-[#2563eb]">*</span>
                </label>
                <Select value={formData.equipmentType} onValueChange={value => handleInputChange('equipmentType', value)}>
                  <SelectTrigger
                    className={`${FIELD} data-[placeholder]:text-msc-text-light/60 ${validationErrors.equipmentType ? FIELD_ERR : FIELD_OK}`}
                  >
                    <SelectValue placeholder={t('leadForm.equipmentType')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-msc-primary/10">
                    {['ultrasound', 'xray', 'mri', 'ct', 'lab', 'other'].map((key) =>
                      <SelectItem key={key} value={key} className="rounded-lg">{t(`leadForm.equipmentTypes.${key}`)}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {validationErrors.equipmentType && <p className={ERROR_TEXT}>{t(validationErrors.equipmentType)}</p>}
              </div>

              {submitError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {t('leadForm.submitError')}
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
                    {t('leadForm.sending')}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {t('leadForm.submit')}
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
