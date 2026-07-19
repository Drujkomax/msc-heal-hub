// Shared product-category labels (FSD: entities/category).
// Single source of truth for category display names across catalog, product,
// home and the dedicated /catalog/category/[slug] landing pages.
import type { Lang } from "~/shared/config/site";

/**
 * Готовая именная группа категории — то, что подставляется в title, h1, описание
 * и schema.org как есть.
 *
 * Почему фраза целиком, а не прилагательное + « оборудование» шаблоном:
 * значения в БД разной природы. «Диагностическое» — прилагательное, и шаблон на
 * нём работал. Но «Телемедицина», «Гинекология», «Стерилизация» — существительные,
 * и получалось «Телемедицина оборудование». А у части категорий слово
 * «оборудование» уже внутри названия («Гемодиализное оборудование»), и шаблон
 * давал «Гемодиализное оборудование оборудование». Фраза целиком снимает оба
 * случая и заодно позволяет выбрать более частотную формулировку под поиск
 * («Оборудование для гемодиализа» вместо «Гемодиализное оборудование»).
 *
 * Ключ — значение category из БД (product_categories.value), регистр и пробелы
 * как есть. Если категории здесь нет, подставится её русское название из БД.
 */
export const CATEGORY_PHRASES: Record<string, Record<Lang, string>> = {
  "Communication systems for hospitals": {
    ru: "Системы связи для больниц",
    en: "Hospital communication systems",
    uz: "Shifoxonalar uchun aloqa tizimlari",
  },
  "Digital surgery": {
    ru: "Оборудование для цифровой хирургии",
    en: "Digital surgery equipment",
    uz: "Raqamli jarrohlik uskunalari",
  },
  "ENT combine": {
    ru: "ЛОР-комбайны",
    en: "ENT combines",
    uz: "LOR-kombaynlar",
  },
  Gynecology: {
    ru: "Гинекологическое оборудование",
    en: "Gynecology equipment",
    uz: "Ginekologiya uskunalari",
  },
  "Hemodialysis equipment": {
    ru: "Оборудование для гемодиализа",
    en: "Hemodialysis equipment",
    uz: "Gemodializ uskunalari",
  },
  "Operating unit": {
    ru: "Оснащение операционного блока",
    en: "Operating unit equipment",
    uz: "Operatsiya bloki jihozlari",
  },
  "Oxygen station": {
    ru: "Кислородные станции",
    en: "Oxygen stations",
    uz: "Kislorod stansiyalari",
  },
  "Perinatal equipment": {
    ru: "Перинатальное оборудование",
    en: "Perinatal equipment",
    uz: "Perinatal uskunalar",
  },
  Physiotherapy: {
    ru: "Физиотерапевтическое оборудование",
    en: "Physiotherapy equipment",
    uz: "Fizioterapiya uskunalari",
  },
  Sterilization: {
    ru: "Стерилизационное оборудование",
    en: "Sterilization equipment",
    uz: "Sterilizatsiya uskunalari",
  },
  Telemedicine: {
    ru: "Оборудование для телемедицины",
    en: "Telemedicine equipment",
    uz: "Telemeditsina uskunalari",
  },
  dental: {
    ru: "Стоматологическое оборудование",
    en: "Dental equipment",
    uz: "Stomatologiya uskunalari",
  },
  diagnostic: {
    ru: "Диагностическое оборудование",
    en: "Diagnostic equipment",
    uz: "Diagnostika uskunalari",
  },
  laboratory: {
    ru: "Лабораторное оборудование",
    en: "Laboratory equipment",
    uz: "Laboratoriya uskunalari",
  },
  resuscitation: {
    ru: "Реанимационное оборудование",
    en: "Resuscitation equipment",
    uz: "Reanimatsiya uskunalari",
  },
};

/**
 * Именная группа категории.
 * Порядок: словарь выше → fallback (русское название из БД) → сырой slug.
 *
 * fallback обязателен именно как аргумент: раньше функция сама возвращала slug
 * при промахе и всегда была truthy, поэтому цепочка
 * `getCategoryLabel(...) || category.name?.ru` никогда не доходила до второго
 * звена — в title уезжало «Gynecology оборудование», хотя в БД лежит
 * «Гинекология» (её и показывал h1). Новая категория, которой ещё нет в словаре,
 * теперь автоматически получает человеческое название из БД.
 */
export function categoryPhrase(value: string, lang: Lang, fallback?: string): string {
  return CATEGORY_PHRASES[value]?.[lang] || fallback?.trim() || value;
}

/** SEO intro copy for a category landing page (RU is the indexable default). */
export function categoryIntro(phrase: string, lang: Lang): string {
  const map: Record<Lang, string> = {
    ru: `${phrase} от Med Service Centre: продажа, аренда, поставка, монтаж и сервисное обслуживание для клиник по всему Узбекистану — Ташкент и регионы. Подбор решений под задачи и бюджет, гарантия и обучение персонала.`,
    en: `${phrase} from Med Service Centre: sales, rental, supply, installation and service for clinics across Uzbekistan — Tashkent and the regions. Solutions tailored to your needs and budget, with warranty and staff training.`,
    uz: `${phrase} Med Service Centre'dan: butun Oʻzbekiston boʻylab — Toshkent va viloyatlardagi klinikalar uchun sotuv, ijara, yetkazib berish, oʻrnatish va servis. Vazifa va byudjetga mos yechimlar, kafolat va xodimlarni oʻqitish.`,
  };
  return map[lang];
}
