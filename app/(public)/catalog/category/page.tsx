import type { Metadata } from "next";
import Link from "next/link";
import { getActiveProducts } from "~/entities/product/api";
import { getCategories } from "~/entities/category/api";
import { categoryPhrase } from "~/entities/category/labels";
import { SITE_URL, SITE_NAME } from "~/shared/config/site";
import { socialMeta } from "~/shared/config/seo";
import { categorySlug } from "@/lib/slugify";

// Хаб категорий — парный к /catalog/manufacturer. Раньше /catalog/category отдавал
// 404, а ссылки на категории были только на главной (6 из 17) и в каталоге (15).
// Часть категорий Search Console держала в «Обнаружена, не проиндексирована»:
// у страницы слишком мало внутренних ссылок, чтобы Google счёл её нужной.
export const revalidate = 300;

const SEO_TITLE = "Категории медицинского оборудования";
const SEO_DESCRIPTION =
  "Направления медицинского оборудования Med Service Centre: диагностика, лаборатория, хирургия, реанимация, стерилизация. Продажа, аренда и сервис по Узбекистану.";
const CANONICAL = `${SITE_URL}/catalog/category`;

export const metadata: Metadata = {
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  keywords: [
    "категории медицинского оборудования",
    "медицинское оборудование Узбекистан",
    "медицинское оборудование Ташкент",
    SITE_NAME,
  ].join(", "),
  alternates: { canonical: CANONICAL },
  ...socialMeta({ title: SEO_TITLE, description: SEO_DESCRIPTION, url: CANONICAL }),
};

export default async function CategoryIndexPage() {
  const [categories, products] = await Promise.all([getCategories(), getActiveProducts()]);

  const counts = new Map<string, number>();
  for (const p of products) {
    if (p.category) counts.set(p.category, (counts.get(p.category) || 0) + 1);
  }

  // Пустые категории не показываем — это тонкая страница, как и пустой бренд.
  const listed = categories
    .filter((c) => (counts.get(c.value) || 0) > 0)
    .map((c) => ({
      phrase: categoryPhrase(c.value, "ru", c.name?.ru),
      href: `/catalog/category/${categorySlug(c.value)}`,
      count: counts.get(c.value) || 0,
    }))
    .sort((a, b) => b.count - a.count);

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: SEO_TITLE,
      description: SEO_DESCRIPTION,
      url: CANONICAL,
      numberOfItems: listed.length,
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Каталог", item: `${SITE_URL}/catalog` },
        { "@type": "ListItem", position: 3, name: "Категории", item: CANONICAL },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: listed.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.phrase,
        url: `${SITE_URL}${c.href}`,
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <nav aria-label="Хлебные крошки" className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-msc-accent">
            Главная
          </Link>
          <span className="mx-2">/</span>
          <Link href="/catalog" className="hover:text-msc-accent">
            Каталог
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Категории</span>
        </nav>

        <h1 className="font-heading text-3xl font-bold text-msc-primary md:text-4xl">
          {SEO_TITLE}
        </h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Оборудование Med Service Centre по направлениям — {listed.length} категорий с поставкой,
          монтажом и сервисным обслуживанием в Ташкенте и регионах Узбекистана.
        </p>

        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listed.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
                className="flex h-full flex-col justify-between gap-2 rounded-xl border border-border p-5 transition-colors hover:border-msc-accent hover:bg-msc-accent/5"
              >
                <span className="font-heading text-lg font-semibold text-foreground">
                  {c.phrase}
                </span>
                <span className="text-sm text-muted-foreground">
                  {c.count} позиций в каталоге
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-muted-foreground">
          Ищете конкретного производителя?{" "}
          <Link href="/catalog/manufacturer" className="text-msc-accent hover:underline">
            Смотрите список брендов
          </Link>
          .
        </p>
      </div>
    </>
  );
}
