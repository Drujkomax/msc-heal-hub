import { NextRequest, NextResponse } from "next/server";
import { toUrlSlug, categorySlug } from "@/lib/slugify";

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
// И бренд, и категория адресуются каноническим ascii-slug (единый хелпер slug на
// все сущности): manufacturer → toUrlSlug, category → categorySlug. Значение из
// старого query канонизированным не бывает («Aksion», «Hemodialysis equipment» с
// пробелом), поэтому нормализуем — иначе 308 увёл бы на /…/Aksion или /…%20 и 404.
function facetRedirect(req: NextRequest): URL | null {
  if (req.nextUrl.pathname !== "/catalog") return null;
  const q = req.nextUrl.searchParams;

  const mfr = toUrlSlug(q.get("manufacturer")?.trim());
  const cat = categorySlug(q.get("category")?.trim());
  const target = mfr
    ? `/catalog/manufacturer/${mfr}`
    : cat
      ? `/catalog/category/${cat}`
      : null;
  if (!target) return null;

  const url = req.nextUrl.clone();
  url.pathname = target;
  url.search = ""; // именно ради этого редирект живёт в proxy, а не в next.config
  return url;
}

// Старые категорийные URL со сырым value из БД (пробелы → %20, заглавные,
// CamelCase) Google краулит плохо и половину нормализует в 404. Один 301 на
// канонический ЧПУ-slug склеивает накопленный вес и убирает дубли. Проверка чисто
// строковая: categorySlug детерминирован и совпадает с generateStaticParams
// категорийной страницы, поэтому БД тут не нужна. Уже-чистый slug не трогаем.
function categoryRedirect(req: NextRequest): URL | null {
  const m = req.nextUrl.pathname.match(/^\/catalog\/category\/([^/]+)\/?$/);
  if (!m) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(m[1]);
  } catch {
    decoded = m[1];
  }
  const clean = categorySlug(decoded);
  if (!clean || clean === m[1]) return null;
  const url = req.nextUrl.clone();
  url.pathname = `/catalog/category/${clean}`;
  url.search = "";
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

  // Склейка старых %20/CamelCase категорий на чистый ЧПУ-slug — постоянный 301.
  const cat = categoryRedirect(req);
  if (cat) return NextResponse.redirect(cat, 301);

  return NextResponse.next();
}

export const config = {
  // Не трогаем ассеты/служебные пути — только страницы
  matcher: ["/((?!_next/|api/|storage/|.*\\..*).*)"],
};
