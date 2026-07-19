import type { Metadata } from "next";
import { getProductBySlug, getActiveProducts } from "~/entities/product/api";
import { getManufacturers } from "~/entities/manufacturer/api";
import { getLang } from "~/shared/i18n/lang";
import { SITE_URL, SITE_NAME, type Lang } from "~/shared/config/site";
import { toUrlSlug, decodeParam } from "@/lib/slugify";
import { ProductDetailView } from "~/widgets/product-detail/product-detail-view";

const FALLBACK_IMAGE =
  "https://medsc.uz/images/og-image.png";

// Prerender every product page at build + revalidate (ISR) so they are CDN/browser
// cacheable instead of fully re-rendered per visit. A catch-all route with no
// generateStaticParams would otherwise default to per-request dynamic (no-store).
// Products added later still render on-demand and get ISR-cached (dynamicParams).
export const revalidate = 300;

export async function generateStaticParams() {
  const [products, manufacturers] = await Promise.all([
    getActiveProducts(),
    getManufacturers(),
  ]);
  const slugOf = (mid: string | null) =>
    manufacturers.find((m) => m.id === mid)?.slug ?? null;
  return products
    .filter((p) => p.slug)
    .map((p) => {
      const ms = toUrlSlug(slugOf(p.manufacturer_id));
      const ps = p.slug as string;
      return { rest: ms && ms !== "unknown" ? [ms, ps] : [ps] };
    });
}

const getCategoryLabel = (category: string, language: Lang) => {
  const categoryLabels = {
    diagnostic: { ru: "Диагностическое", en: "Diagnostic", uz: "Diagnostika" },
    surgical: { ru: "Хирургическое", en: "Surgical", uz: "Jarrohlik" },
    monitoring: { ru: "Мониторинг", en: "Monitoring", uz: "Monitoring" },
    laboratory: { ru: "Лабораторное", en: "Laboratory", uz: "Laboratoriya" },
    rehabilitation: {
      ru: "Реабилитационное",
      en: "Rehabilitation",
      uz: "Reabilitatsiya",
    },
    dental: { ru: "Стоматологическое", en: "Dental", uz: "Stomatologiya" },
    ophthalmology: {
      ru: "Офтальмологическое",
      en: "Ophthalmology",
      uz: "Oftalmologiya",
    },
    furniture: {
      ru: "Медицинская мебель",
      en: "Medical Furniture",
      uz: "Tibbiy mebel",
    },
  };
  return (
    categoryLabels[category as keyof typeof categoryLabels]?.[language] ||
    category
  );
};

function localized(
  field: unknown,
  language: Lang,
  fallback = "",
): string {
  if (typeof field === "object" && field !== null) {
    const obj = field as Record<string, string>;
    return obj[language] || obj.ru || obj.en || fallback;
  }
  return field ? String(field) : fallback;
}

// Обрезаем description ПО ГРАНИЦЕ СЛОВА и только если он реально длинный.
// Раньше был slice(0, 149) + «…», который рубил посреди слова — в выдаче сниппеты
// выглядели как «…от оф…». 160 символов — то, что Google показывает на десктопе.
const DESCRIPTION_LIMIT = 160;
function clampDescription(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= DESCRIPTION_LIMIT) return clean;
  const cut = clean.slice(0, DESCRIPTION_LIMIT);
  const lastSpace = cut.lastIndexOf(" ");
  // Точку/запятую в конце обрезка убираем, чтобы не получилось «слово,…»
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:—-]+$/, "")}…`;
}

function ogImage(cover: string | null | undefined): string {
  if (!cover) return FALLBACK_IMAGE;
  return cover.startsWith("http") ? cover : `https://medsc.uz${cover}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ rest: string[] }>;
}): Promise<Metadata> {
  const { rest } = await params;
  const slug = decodeParam(rest[rest.length - 1]);
  const product = await getProductBySlug(slug);
  const lang = (await getLang()) as Lang;

  if (!product) {
    return {
      title: "Товар не найден",
      description:
        "Карточка медицинского оборудования не найдена. Вернитесь в каталог Med Service Centre, чтобы подобрать подходящее решение и сервис аренды для клиники.",
      keywords:
        "товар не найден, каталог медоборудования, Med Service Centre, выбор оборудования",
      robots: { index: false, follow: false },
    };
  }

  const productName = localized(
    product.name,
    lang,
    "Медицинское оборудование",
  );
  const manufacturers = await getManufacturers();
  const manufacturer = manufacturers.find(
    (m) => m.id === product.manufacturer_id,
  );
  const manufacturerName = localized(manufacturer?.name, lang);
  const categoryLabel = getCategoryLabel(product.category, lang);

  // Описание берём СВОЁ у товара, а шаблон оставляем только как запасной вариант:
  // раньше шаблон применялся всегда, и все 100+ карточек уходили в индекс с почти
  // одинаковым description (менялось лишь название) — для Google это дубли сниппетов.
  const ownDescription = localized(product.description, lang).trim();
  const templateDescription = `${productName} — ${categoryLabel.toLowerCase()} оборудование${
    manufacturerName ? ` ${manufacturerName}` : ""
  }. Поставка, сервис и аренда для клиник Узбекистана, официальный партнёр в Ташкенте.`;
  const metaDescription = clampDescription(ownDescription || templateDescription);

  const metaKeywords = [
    productName,
    manufacturerName,
    categoryLabel,
    `купить ${productName}`,
    "медицинское оборудование Ташкент",
    "медицинское оборудование Узбекистан",
    "Med Service Centre",
    "аренда медоборудования",
  ]
    .filter(Boolean)
    .join(", ");

  const ms = toUrlSlug(manufacturer?.slug);
  const productPath =
    ms && ms !== "unknown"
      ? `/catalog/${ms}/${encodeURIComponent(product.slug || product.id)}`
      : `/catalog/${encodeURIComponent(product.slug || product.id)}`;
  const canonicalUrl = `${SITE_URL}${productPath}`;
  const image = ogImage(product.images?.cover);
  // Product covers render at a 1080×1350 aspect; the fallback OG asset is 770×820.
  const ogDims = product.images?.cover
    ? { width: 1080, height: 1350 }
    : { width: 770, height: 820 };

  return {
    // Бренд добавляет title.template в корневом layout — здесь его НЕ дублируем.
    title: `${productName} — купить в Узбекистане`,
    description: metaDescription,
    keywords: metaKeywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${productName} — медицинское оборудование`,
      description: `${productName}. Официальная поставка, сервис и аренда медицинского оборудования в Узбекистане от Med Service Centre.`,
      url: canonicalUrl,
      type: "website",
      siteName: SITE_NAME,
      locale: "ru_RU",
      images: [{ url: image, ...ogDims, alt: productName }],
    },
    twitter: {
      card: "summary_large_image",
      title: productName,
      description: `${productName} — ${categoryLabel} оборудование. Купить или арендовать в Med Service Centre.`,
      images: [image],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ rest: string[] }>;
}) {
  const { rest } = await params;
  const slug = decodeParam(rest[rest.length - 1]);
  const product = await getProductBySlug(slug);

  if (!product) {
    const { notFound } = await import("next/navigation");
    return notFound();
  }

  const lang = (await getLang()) as Lang;
  const [manufacturers, allProducts] = await Promise.all([
    getManufacturers(),
    getActiveProducts(),
  ]);

  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // ── Structured data: Product (+ offers when priced) and BreadcrumbList ──
  const productName = localized(product.name, lang, "Медицинское оборудование");
  const description = localized(product.description, lang, productName);
  const manufacturer = manufacturers.find((m) => m.id === product.manufacturer_id);
  const brandName = localized(manufacturer?.name, lang) || SITE_NAME;
  const ms = toUrlSlug(manufacturer?.slug);
  const canonicalUrl =
    ms && ms !== "unknown"
      ? `${SITE_URL}/catalog/${ms}/${encodeURIComponent(product.slug || product.id)}`
      : `${SITE_URL}/catalog/${encodeURIComponent(product.slug || product.id)}`;
  const images = [product.images?.cover, ...(product.images?.gallery || [])]
    .filter(Boolean)
    .map((c) => ogImage(c));
  const priceNum = product.price ? Number(String(product.price).replace(/[^\d.]/g, "")) : NaN;
  const priceValidUntil = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const productSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    description,
    image: images.length ? images : [FALLBACK_IMAGE],
    sku: product.id,
    category: getCategoryLabel(product.category, lang),
    brand: { "@type": "Brand", name: brandName },
    url: canonicalUrl,
    ...(Number.isFinite(priceNum) && priceNum > 0
      ? {
          offers: {
            "@type": "Offer",
            price: priceNum,
            priceCurrency: product.currency || "USD",
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            priceValidUntil,
            url: canonicalUrl,
            seller: { "@type": "Organization", name: SITE_NAME },
          },
        }
      : {
          offers: {
            "@type": "Offer",
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            url: canonicalUrl,
            seller: { "@type": "Organization", name: SITE_NAME },
          },
        }),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Каталог", item: `${SITE_URL}/catalog` },
      { "@type": "ListItem", position: 3, name: productName, item: canonicalUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([productSchema, breadcrumbSchema]) }}
      />
      <ProductDetailView product={product} manufacturers={manufacturers} related={related} />
    </>
  );
}
