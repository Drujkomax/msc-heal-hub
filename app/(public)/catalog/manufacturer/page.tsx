import type { Metadata } from "next";
import Link from "next/link";
import { getActiveProducts } from "~/entities/product/api";
import { getManufacturers } from "~/entities/manufacturer/api";
import { SITE_URL, SITE_NAME } from "~/shared/config/site";
import { socialMeta } from "~/shared/config/seo";
import { toUrlSlug } from "@/lib/slugify";

// Хаб брендов. Раньше /catalog/manufacturer отдавал 404, и на 62 страницы
// производителей не вело ни одной ссылки с верхних уровней — только с карточек
// товаров. Google их находил по sitemap и ставил «Обнаружена, не проиндексирована»:
// у страницы без внутренних ссылок нет сигнала, что она нужна сайту.
export const revalidate = 300;

const SEO_TITLE = "Бренды медицинского оборудования";
const SEO_DESCRIPTION =
  "Производители медицинского оборудования, которое поставляет Med Service Centre в Узбекистане: продажа, аренда и сервис по Ташкенту и регионам.";
const CANONICAL = `${SITE_URL}/catalog/manufacturer`;

export const metadata: Metadata = {
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  keywords: [
    "бренды медицинского оборудования",
    "производители медицинского оборудования Узбекистан",
    "медицинское оборудование Ташкент",
    SITE_NAME,
  ].join(", "),
  alternates: { canonical: CANONICAL },
  ...socialMeta({ title: SEO_TITLE, description: SEO_DESCRIPTION, url: CANONICAL }),
};

export default async function ManufacturerIndexPage() {
  const [manufacturers, products] = await Promise.all([
    getManufacturers(),
    getActiveProducts(),
  ]);

  const counts = new Map<string, number>();
  for (const p of products) {
    if (p.manufacturer_id) counts.set(p.manufacturer_id, (counts.get(p.manufacturer_id) || 0) + 1);
  }

  // В индекс пускаем только бренды с товарами: пустая страница бренда — ровно тот
  // «тонкий» URL, из-за которого Google и отказывает в индексации.
  const listed = manufacturers
    .filter((m) => m.slug && toUrlSlug(m.slug) !== "unknown" && (counts.get(m.id) || 0) > 0)
    .map((m) => ({
      name: m.name,
      href: `/catalog/manufacturer/${toUrlSlug(m.slug)}`,
      count: counts.get(m.id) || 0,
    }));

  const groups = new Map<string, typeof listed>();
  for (const m of listed) {
    const letter = (m.name || "?").charAt(0).toLocaleUpperCase("ru");
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter)!.push(m);
  }
  const letters = [...groups.keys()].sort((a, b) => a.localeCompare(b, "ru"));

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
        { "@type": "ListItem", position: 3, name: "Бренды", item: CANONICAL },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: listed.map((m, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: m.name,
        url: `${SITE_URL}${m.href}`,
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
          <span className="text-foreground">Бренды</span>
        </nav>

        <h1 className="font-heading text-3xl font-bold text-msc-primary md:text-4xl">
          {SEO_TITLE}
        </h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Med Service Centre поставляет, монтирует и обслуживает оборудование {listed.length}{" "}
          производителей. Выберите бренд, чтобы посмотреть доступные позиции, условия поставки и
          сервисной поддержки в Узбекистане.
        </p>

        {letters.map((letter) => (
          <section key={letter} className="mt-10">
            <h2 className="font-heading text-xl font-semibold text-msc-accent">{letter}</h2>
            <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {groups.get(letter)!.map((m) => (
                <li key={m.href}>
                  <Link
                    href={m.href}
                    className="flex items-baseline justify-between gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-msc-accent/5"
                  >
                    <span className="font-medium text-foreground">{m.name}</span>
                    <span className="shrink-0 text-sm text-muted-foreground">{m.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
