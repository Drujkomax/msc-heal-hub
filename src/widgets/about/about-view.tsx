"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, GraduationCap, Package, Wrench } from "lucide-react";
import dynamic from "next/dynamic";
const LeadForm = dynamic(() => import("~/features/lead-form/lead-form").then(m => m.LeadForm), { ssr: false });
import { useLang } from "~/shared/i18n/i18n-provider";

// Стили из дизайн-системы главной (см. home-view): спокойный светлый премиум
const PRIMARY_BTN =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-msc-primary px-7 py-3.5 text-base font-semibold text-white shadow-[0_12px_32px_-14px_rgba(12,17,57,0.5)] transition-colors hover:bg-msc-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msc-primary focus-visible:ring-offset-2';
const OUTLINE_BTN =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-msc-primary/20 bg-white px-7 py-3.5 text-base font-semibold text-msc-primary transition-colors hover:border-msc-primary/40 hover:bg-msc-primary/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msc-primary/40';

const HIGHLIGHT_ICONS = [Package, Wrench, GraduationCap];

export function AboutView() {
  const language = useLang();
  const [showConsultationForm, setShowConsultationForm] = useState(false);

  const content = {
    ru: {
      title: "О компании Med Service Centre",
      intro:
        "Med Service Centre — поставщик медицинского оборудования в Узбекистане. Мы подбираем решения для клиник и лабораторий, организуем поставку, ввод в эксплуатацию и сервисное сопровождение.",
      stats: [
        { value: "8+", label: "лет на рынке" },
        { value: "300+", label: "выполненных проектов" },
        { value: "24/7", label: "сервисная поддержка" },
      ],
      highlightsTitle: "Что мы делаем",
      highlights: [
        {
          title: "Поставка оборудования",
          text: "УЗИ, лабораторные анализаторы, хирургические системы, мониторинг и реабилитация.",
        },
        {
          title: "Сервис и обучение",
          text: "Установка, ввод в эксплуатацию, обучение персонала и техническая поддержка 24/7.",
        },
        {
          title: "Аренда и сопровождение",
          text: "Гибкие условия аренды, консультации и поддержка на всех этапах закупки.",
        },
      ],
      directionsTitle: "Основные направления",
      directions: [
        "Диагностическое оборудование и УЗИ-аппараты",
        "Лабораторные анализаторы и расходные материалы",
        "Хирургическое оборудование и электрохирургия",
        "Мониторинг пациентов и реанимация",
        "Стоматологическое и офтальмологическое оборудование",
        "Медицинская мебель и оснащение кабинетов",
      ],
      advantagesTitle: "Почему клиники выбирают нас",
      advantages: [
        "Подбор техники под клинические задачи и бюджет",
        "Официальные поставки и прозрачная логистика",
        "Гарантийное и постгарантийное обслуживание",
        "Опыт внедрения оборудования в частных и государственных клиниках",
      ],
      geographyTitle: "География и сроки",
      geographyText:
        "Работаем по Ташкенту и регионам Узбекистана. Сроки поставки согласуем заранее, обеспечиваем сопровождение на всех этапах.",
      ctaTitle: "Нужна консультация по подбору?",
      ctaText:
        "Расскажите о задаче, и мы подготовим коммерческое предложение под ваш бюджет и сроки.",
      ctaCatalog: "Перейти в каталог",
      ctaContact: "Получить консультацию",
      seoDescription:
        "Med Service Centre — поставщик медицинского оборудования в Узбекистане. Поставка, аренда, сервис, обучение персонала и подбор техники для клиник.",
      seoKeywords:
        "о компании Med Service Centre, медицинское оборудование Узбекистан, поставка медтехники Ташкент, аренда медоборудования, сервис медтехники",
    },
    en: {
      title: "About Med Service Centre",
      intro:
        "Med Service Centre supplies medical equipment in Uzbekistan. We select solutions for clinics and labs, manage delivery, commissioning, and ongoing service support.",
      stats: [
        { value: "8+", label: "years in the market" },
        { value: "300+", label: "completed projects" },
        { value: "24/7", label: "service support" },
      ],
      highlightsTitle: "What we do",
      highlights: [
        {
          title: "Equipment supply",
          text: "Ultrasound, laboratory analyzers, surgical systems, monitoring and rehabilitation.",
        },
        {
          title: "Service and training",
          text: "Installation, commissioning, staff training, and 24/7 technical support.",
        },
        {
          title: "Rental and support",
          text: "Flexible rental options, consultations, and support at every procurement stage.",
        },
      ],
      directionsTitle: "Key areas",
      directions: [
        "Diagnostic equipment and ultrasound systems",
        "Laboratory analyzers and consumables",
        "Surgical equipment and electrosurgery",
        "Patient monitoring and intensive care",
        "Dental and ophthalmology equipment",
        "Medical furniture and room outfitting",
      ],
      advantagesTitle: "Why clinics choose us",
      advantages: [
        "Equipment selection aligned with clinical tasks and budget",
        "Official supply chain and transparent logistics",
        "Warranty and post-warranty service",
        "Experience across private and public healthcare facilities",
      ],
      geographyTitle: "Coverage and timelines",
      geographyText:
        "We serve Tashkent and all regions of Uzbekistan. Delivery timelines are agreed in advance with full support.",
      ctaTitle: "Need guidance for procurement?",
      ctaText:
        "Share your requirements, and we will prepare a tailored offer with the right equipment and timelines.",
      ctaCatalog: "Open catalog",
      ctaContact: "Get a consultation",
      seoDescription:
        "Med Service Centre supplies medical equipment in Uzbekistan. Sales, rental, service, staff training, and procurement support for clinics.",
      seoKeywords:
        "Med Service Centre, medical equipment Uzbekistan, supply in Tashkent, rental, service and training",
    },
    uz: {
      title: "Med Service Centre haqida",
      intro:
        "Med Service Centre O'zbekistonda tibbiy uskunalar yetkazib beradi. Biz klinikalar va laboratoriyalar uchun yechim tanlaymiz, yetkazib berish va servisni tashkil qilamiz.",
      stats: [
        { value: "8+", label: "yillik tajriba" },
        { value: "300+", label: "bajarilgan loyihalar" },
        { value: "24/7", label: "servis xizmati" },
      ],
      highlightsTitle: "Biz nima qilamiz",
      highlights: [
        {
          title: "Uskunalar yetkazib berish",
          text: "UZI, laboratoriya analizatorlari, jarrohlik tizimlari va monitoring.",
        },
        {
          title: "Servis va o'qitish",
          text: "O'rnatish, ishga tushirish, xodimlarni o'qitish va 24/7 qo'llab-quvvatlash.",
        },
        {
          title: "Ijara va hamrohlik",
          text: "Moslashuvchan ijara shartlari va xarid jarayonida to'liq yordam.",
        },
      ],
      directionsTitle: "Asosiy yo'nalishlar",
      directions: [
        "Diagnostika uskunalari va UZI apparatlari",
        "Laboratoriya analizatorlari va sarf materiallari",
        "Jarrohlik uskunalari va elektrojarrohlik",
        "Bemorlarni monitoring qilish va reanimatsiya",
        "Stomatologiya va oftalmologiya uskunalari",
        "Tibbiy mebel va xonalarni jihozlash",
      ],
      advantagesTitle: "Nega bizni tanlashadi",
      advantages: [
        "Klinik vazifalarga mos tanlov va byudjetga moslash",
        "Rasmiy yetkazib berish va shaffof logistika",
        "Kafolatli va kafolatsiz servis",
        "Xususiy va davlat klinikalarida tajriba",
      ],
      geographyTitle: "Qamrov va muddatlar",
      geographyText:
        "Toshkent va O'zbekiston bo'ylab ishlaymiz. Yetkazib berish muddatlari oldindan kelishiladi.",
      ctaTitle: "Uskunani tanlash bo'yicha yordam kerakmi?",
      ctaText:
        "Talablaringizni yuboring, biz sizga mos tijorat taklifini tayyorlaymiz.",
      ctaCatalog: "Katalogga o'tish",
      ctaContact: "Konsultatsiya olish",
      seoDescription:
        "Med Service Centre — O'zbekistonda tibbiy uskunalar yetkazib beruvchi. Sotuv, ijara, servis va xodimlarni o'qitish.",
      seoKeywords:
        "Med Service Centre, tibbiy uskunalar O'zbekiston, Toshkent yetkazib berish, ijara, servis",
    },
  };

  const currentContent = content[language] || content.ru;

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <h1 className="mb-4 font-display text-4xl font-semibold text-msc-primary md:text-5xl">
            {currentContent.title}
          </h1>
          <p className="text-lg leading-relaxed text-msc-text-light">
            {currentContent.intro}
          </p>
        </header>

        {/* Цифры компании */}
        <section className="mx-auto mb-14 grid max-w-3xl grid-cols-3 gap-4">
          {currentContent.stats.map((s) => (
            <div key={s.value} className="text-center">
              <div className="font-display text-3xl font-semibold text-msc-primary md:text-4xl">{s.value}</div>
              <div className="mt-1 text-sm text-msc-text-light">{s.label}</div>
            </div>
          ))}
        </section>

        <section className="mb-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {currentContent.highlights.map((item, index) => {
            const Icon = HIGHLIGHT_ICONS[index] ?? Package;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-msc-primary/10 bg-white p-6 shadow-[0_16px_48px_-30px_rgba(12,17,57,0.35)]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563eb]/[0.08]">
                  <Icon className="h-5 w-5 text-[#2563eb]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-msc-primary">{item.title}</h3>
                <p className="text-sm leading-relaxed text-msc-text-light">{item.text}</p>
              </div>
            );
          })}
        </section>

        <section className="mb-14 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <h2 className="mb-5 font-display text-2xl font-semibold text-msc-primary">
              {currentContent.directionsTitle}
            </h2>
            <ul className="space-y-3">
              {currentContent.directions.map((item) => (
                <li key={item} className="flex items-start gap-3 text-msc-text-light">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#2563eb]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-5 font-display text-2xl font-semibold text-msc-primary">
              {currentContent.advantagesTitle}
            </h2>
            <ul className="space-y-3">
              {currentContent.advantages.map((item) => (
                <li key={item} className="flex items-start gap-3 text-msc-text-light">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#2563eb]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* items-start: раньше items-center «ронял» левую колонку относительно
            более высокой CTA-карточки, и секция выглядела съехавшей */}
        <section className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 font-display text-2xl font-semibold text-msc-primary">
              {currentContent.geographyTitle}
            </h2>
            <p className="leading-relaxed text-msc-text-light">{currentContent.geographyText}</p>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-msc-primary/10 bg-gradient-to-br from-[#f3f7fe] to-[#eaf0fd] p-8 shadow-[0_30px_80px_-40px_rgba(12,17,57,0.35)]">
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#2563eb]/10 blur-[70px]" />
            <h3 className="relative mb-3 font-display text-xl font-semibold text-msc-primary">
              {currentContent.ctaTitle}
            </h3>
            <p className="relative mb-6 text-sm leading-relaxed text-msc-text-light">
              {currentContent.ctaText}
            </p>
            <div className="relative flex flex-col gap-3 sm:flex-row">
              <Link href="/catalog" className={PRIMARY_BTN}>
                {currentContent.ctaCatalog}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button onClick={() => setShowConsultationForm(true)} className={OUTLINE_BTN}>
                {currentContent.ctaContact}
              </button>
            </div>
          </div>
        </section>
      </div>

      {showConsultationForm && (
        <LeadForm onClose={() => setShowConsultationForm(false)} />
      )}
    </div>
  );
}
