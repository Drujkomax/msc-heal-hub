import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActiveProducts } from "~/entities/product/api";
import { getCategories } from "~/entities/category/api";
import { getManufacturers } from "~/entities/manufacturer/api";
import { categoryPhrase, categoryIntro } from "~/entities/category/labels";
import { getLang } from "~/shared/i18n/lang";
import { SITE_URL, SITE_NAME, type Lang } from "~/shared/config/site";
import { toUrlSlug, decodeParam } from "@/lib/slugify";
import { CatalogView } from "~/widgets/catalog/catalog-view";

const OG_IMAGE = "https://medsc.uz/images/og-image.png";

// Indexable category landing pages: prerendered for every category + ISR.
export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.value }));
}

async function findCategory(slug: string) {
  const categories = await getCategories();
  return categories.find((c) => c.value === slug) || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeParam(rawSlug);
  const category = await findCategory(slug);
  if (!category) {
    return { title: "Категория не найдена", robots: { index: false, follow: true } };
  }
  const lang = (await getLang()) as Lang;
  // Готовая именная группа: «Гинекологическое оборудование», «Оборудование для
  // гемодиализа». Дописывать « оборудование» шаблоном нельзя — часть названий
  // это слово уже содержит, а часть является существительным.
  const phrase = categoryPhrase(slug, lang, category.name?.[lang] || category.name?.ru);
  const canonical = `${SITE_URL}/catalog/category/${encodeURIComponent(slug)}`;
  // Бренд добавляет title.template в корневом layout — здесь его НЕ дублируем.
  const title = `${phrase} в Узбекистане`;
  const description = `${phrase}: продажа, аренда и сервис от Med Service Centre. Поставка по Ташкенту и всему Узбекистану.`;

  return {
    title,
    description,
    keywords: [
      phrase,
      `${phrase} Ташкент`,
      "медицинское оборудование Узбекистан",
      "купить медоборудование",
      SITE_NAME,
    ].join(", "),
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: SITE_NAME,
      locale: "ru_RU",
      images: [{ url: OG_IMAGE, width: 770, height: 820, alt: `${phrase} — ${SITE_NAME}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeParam(rawSlug);
  const [category, products, categories, manufacturers] = await Promise.all([
    findCategory(slug),
    getActiveProducts(),
    getCategories(),
    getManufacturers(),
  ]);
  if (!category) notFound();

  const lang = (await getLang()) as Lang;
  const phrase = categoryPhrase(slug, lang, category.name?.[lang] || category.name?.ru);
  // Schema.org отдаём по-русски независимо от языка интерфейса — это индексируемый
  // язык сайта, поэтому фразу для неё разрешаем отдельно, в ru.
  const phraseRu = categoryPhrase(slug, "ru", category.name?.ru);
  const canonical = `${SITE_URL}/catalog/category/${encodeURIComponent(slug)}`;
  const inCategory = products.filter((p) => p.category === slug);

  const slugOf = (mid: string | null) => manufacturers.find((m) => m.id === mid)?.slug;
  const pathOf = (p: (typeof products)[number]) => {
    const ms = toUrlSlug(slugOf(p.manufacturer_id));
    const ps = p.slug || p.id;
    return ms && ms !== "unknown" ? `/catalog/${ms}/${ps}` : `/catalog/${ps}`;
  };
  const abs = (cover?: string | null) =>
    cover ? (cover.startsWith("http") ? cover : `${SITE_URL}${cover}`) : undefined;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: phraseRu,
    description: categoryIntro(phraseRu, "ru"),
    url: canonical,
    numberOfItems: inCategory.length,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Каталог", item: `${SITE_URL}/catalog` },
      { "@type": "ListItem", position: 3, name: phrase, item: canonical },
    ],
  };
  const itemListSchema = inCategory.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: inCategory.slice(0, 24).map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Product",
            name: p.name?.ru || p.name,
            url: `${SITE_URL}${pathOf(p)}`,
            image: abs(p.images?.cover),
            category: phrase,
          },
        })),
      }
    : null;

  const schemas = [collectionSchema, breadcrumbSchema, ...(itemListSchema ? [itemListSchema] : [])];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <CatalogView
        products={products}
        categories={categories}
        manufacturers={manufacturers}
        initialCategory={slug}
      />
    </>
  );
}
