import { NextRequest, NextResponse } from "next/server";
import { toUrlSlug } from "@/lib/slugify";

// Разводим админку и публичный сайт по хостам:
//   admin.medsc.uz → только /admin/* (всё остальное уводим на /admin,
//                    плюс noindex, чтобы поддомен не дублировал сайт в поиске);
//   medsc.uz       → /admin* закрыт, 308 на admin.medsc.uz (старые закладки
//                    сотрудников продолжают работать);
//   localhost и прочие хосты (dev) — без ограничений.
const ADMIN_HOST = "admin.medsc.uz";
const MAIN_HOSTS = new Set(["medsc.uz", "www.medsc.uz"]);

// Фасетные URL каталога → ЧПУ-страницы, одним 308 и с ЧИСТЫМ адресом.
// В Search Console у /catalog?category=… и /catalog?manufacturer=… есть позиции и
// показы, но они были закрыты в robots.txt — Google их ранжировал, не имея права
// прочитать. Схема URL остаётся одна (ЧПУ), параметрический вариант отдаёт 308 и
// передаёт накопленный вес. Делаем это здесь, а не в redirects() из next.config:
// тот дописывает исходный query к цели и плодит /catalog/manufacturer/aksion
// ?manufacturer=aksion — тот самый дубль, ради устранения которого всё затевалось.
// manufacturer проверяем раньше category: у комбинированного URL приоритет у
// карточки бренда, иначе редирект увёл бы на категорию и потерял фильтр.
// Бренд и категория адресуются по-разному, и это НЕ описка:
//   /catalog/manufacturer/[slug] ищет через toUrlSlug(m.slug) === slug, то есть
//     ждёт канонический ascii-слаг («aksion»). Значение из старого query
//     канонизированным не бывает — сам виджет каталога сравнивает его через
//     toUrlSlug(), — поэтому здесь нормализуем, иначе ?manufacturer=Aksion
//     дал бы 308 на /catalog/manufacturer/Aksion и 404 в конце.
//   /catalog/category/[slug] сравнивает с сырым value из БД («Hemodialysis
//     equipment», с пробелом и заглавной), так что его только кодируем.
function facetRedirect(req: NextRequest): URL | null {
  if (req.nextUrl.pathname !== "/catalog") return null;
  const q = req.nextUrl.searchParams;

  const mfr = toUrlSlug(q.get("manufacturer")?.trim());
  const cat = q.get("category")?.trim();
  const target = mfr
    ? `/catalog/manufacturer/${encodeURIComponent(mfr)}`
    : cat
      ? `/catalog/category/${encodeURIComponent(cat)}`
      : null;
  if (!target) return null;

  const url = req.nextUrl.clone();
  url.pathname = target;
  url.search = ""; // именно ради этого редирект живёт в proxy, а не в next.config
  return url;
}

export function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase().split(":")[0];
  const { pathname } = req.nextUrl;
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

  if (host === ADMIN_HOST) {
    if (!isAdminPath) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  if (MAIN_HOSTS.has(host) && isAdminPath) {
    const url = req.nextUrl.clone();
    url.protocol = "https";
    url.host = ADMIN_HOST;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  // Строго после разводки по хостам: на admin.medsc.uz любой публичный путь и так
  // уходит на /admin, и фасетный редирект добавлял бы туда лишний прыжок.
  const facet = facetRedirect(req);
  if (facet) return NextResponse.redirect(facet, 308);

  return NextResponse.next();
}

export const config = {
  // Не трогаем ассеты/служебные пути — только страницы
  matcher: ["/((?!_next/|api/|storage/|.*\\..*).*)"],
};
