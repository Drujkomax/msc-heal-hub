import { getCategories } from "~/entities/category/api";
import { getActiveProducts } from "~/entities/product/api";
import { getManufacturers } from "~/entities/manufacturer/api";
import { SITE_URL, SITE_NAME } from "~/shared/config/site";
import { toUrlSlug } from "@/lib/slugify";

// llms.txt — карта сайта для ИИ-ассистентов (ChatGPT, Perplexity, Claude и т.д.).
// Отдаём тем же набором сущностей, что и sitemap.xml, но в человекочитаемом виде:
// краулеры-LLM берут отсюда структуру каталога вместо того, чтобы гадать по HTML.
// Кэш на час — состав категорий и брендов меняется редко.
export const revalidate = 3600;

export async function GET() {
  let categoryLines: string[] = [];
  let manufacturerLines: string[] = [];

  try {
    const [categories, manufacturers, products] = await Promise.all([
      getCategories(),
      getManufacturers(),
      getActiveProducts(),
    ]);

    // Тот же фильтр, что в sitemap.ts: пустые категории и бренды закрыты noindex,
    // и звать на них ИИ-краулеров смысла нет — llms.txt не должен расходиться с картой.
    const usedCategories = new Set(products.map((p) => p.category).filter(Boolean));
    const withProducts = new Set(products.map((p) => p.manufacturer_id).filter(Boolean));

    categoryLines = categories
      .filter((c) => usedCategories.has(c.value))
      .map((c) => {
        const label = c.name?.ru || c.value;
        return `- [${label}](${SITE_URL}/catalog/category/${encodeURIComponent(c.value)})`;
      });

    manufacturerLines = manufacturers
      .filter((m) => m.slug && withProducts.has(m.id))
      .map((m) => {
        const name = typeof m.name === "object" ? m.name?.ru || m.slug : m.name;
        return `- [${name}](${SITE_URL}/catalog/manufacturer/${toUrlSlug(m.slug)})`;
      });
  } catch {
    // API недоступен → отдаём хотя бы статическую часть, как это делает sitemap.ts
  }

  const body = `# ${SITE_NAME}

> Поставка, сервис и аренда медицинского оборудования в Узбекистане: УЗИ-аппараты,
> анализаторы, хирургические и лабораторные системы. Офис в Ташкенте, работа по всей
> стране. На рынке с 2016 года.

## Основные страницы

- [Главная](${SITE_URL}/)
- [Каталог оборудования](${SITE_URL}/catalog)
- [Категории оборудования](${SITE_URL}/catalog/category)
- [Бренды и производители](${SITE_URL}/catalog/manufacturer)
- [Услуги: монтаж, сервис 24/7, аренда](${SITE_URL}/services)
- [О компании](${SITE_URL}/about)
- [Контакты](${SITE_URL}/contacts)

## Категории оборудования
${categoryLines.length ? categoryLines.join("\n") : "- [Каталог](" + SITE_URL + "/catalog)"}

## Производители
${manufacturerLines.length ? manufacturerLines.join("\n") : "- [Каталог](" + SITE_URL + "/catalog)"}

## Контакты

- Телефон: +998 90 944-34-82
- E-mail: info@medsc.uz
- Адрес: Узбекистан, Ташкент, ул. Асака, 32
- Telegram: https://t.me/medsc_uz

## Дополнительно

- [sitemap.xml](${SITE_URL}/sitemap.xml)
- [Политика конфиденциальности](${SITE_URL}/privacy-policy)
- [Условия использования](${SITE_URL}/terms-of-use)
`;

  // getCategories/getManufacturers глотают ошибку и возвращают [] — при блипе API
  // мы бы закэшировали обрезанный файл на сутки (поймано на первой же сборке:
  // секция производителей уехала в заглушку). Неполный ответ кэшируем на минуту,
  // чтобы он сам починился, полный — на час.
  const degraded = !categoryLines.length || !manufacturerLines.length;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": degraded
        ? "public, max-age=0, s-maxage=60"
        : "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
