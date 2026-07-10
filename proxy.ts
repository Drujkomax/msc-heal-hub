import { NextRequest, NextResponse } from "next/server";

// Разводим админку и публичный сайт по хостам:
//   admin.medsc.uz → только /admin/* (всё остальное уводим на /admin,
//                    плюс noindex, чтобы поддомен не дублировал сайт в поиске);
//   medsc.uz       → /admin* закрыт, 308 на admin.medsc.uz (старые закладки
//                    сотрудников продолжают работать);
//   localhost и прочие хосты (dev) — без ограничений.
const ADMIN_HOST = "admin.medsc.uz";
const MAIN_HOSTS = new Set(["medsc.uz", "www.medsc.uz"]);

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

  return NextResponse.next();
}

export const config = {
  // Не трогаем ассеты/служебные пути — только страницы
  matcher: ["/((?!_next/|api/|storage/|.*\\..*).*)"],
};
