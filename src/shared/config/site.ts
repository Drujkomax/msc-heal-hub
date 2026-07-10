// Shared site configuration (FSD: shared/config).
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:6001").replace(/\/+$/, "");

// Server-side data fetches use the API's internal Docker address when set
// (e.g. http://msc-api:6001) to skip the public hairpin (DNS → Caddy → back).
// Not NEXT_PUBLIC → undefined in the browser, so client code falls back to API_URL.
export const API_INTERNAL_URL = (process.env.API_INTERNAL_URL || API_URL).replace(/\/+$/, "");
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://medsc.uz").replace(/\/+$/, "");

export const SITE_NAME = "Med Service Centre";

// Resolve a stored image path to a direct, absolute API URL. Used where an
// absolute URL is REQUIRED: Open Graph / social cards, emails, admin exports.
export function imageUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  return path.startsWith("http") ? path : `${API_URL}${path}`;
}

// Hostnames our own storage/API is served from. A stored cover value may be an
// absolute URL (https://api.medsc.uz/storage/…) or a bare path (/storage/…).
const OWN_API_HOSTS = new Set(["api.medsc.uz", "medsc.api.jaragency.uz"]);

// Display variant for next/image. Always returns a SAME-ORIGIN relative path so
// the photo is fetched from the Next origin and proxied to the INTERNAL backend
// via the /storage rewrite — skipping the public hairpin + TLS handshake that
// made catalog images intermittently time out. Use this for <Image src>; use
// imageUrl() only when an absolute URL is required (see above).
export function imageSrc(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) {
    try {
      const u = new URL(path);
      if (OWN_API_HOSTS.has(u.hostname)) return `${u.pathname}${u.search}`;
      return path; // external image (e.g. manufacturer logo) → leave absolute
    } catch {
      return path;
    }
  }
  return path.startsWith("/") ? path : `/${path}`;
}

// Tiny neutral blur shown by next/image while a remote photo loads (replaces the
// empty grey box). base64 of an 8×10 #eef0f3 rect SVG.
export const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjEwIj48cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2VlZjBmMyIvPjwvc3ZnPg==";

export type Lang = "ru" | "en" | "uz";
export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "uz", label: "O‘zbekcha", flag: "🇺🇿" },
];
export const DEFAULT_LANG: Lang = "ru";

export const PUBLIC_NAV: { href: string; label: Record<Lang, string> }[] = [
  { href: "/", label: { ru: "Главная", en: "Home", uz: "Bosh sahifa" } },
  { href: "/catalog", label: { ru: "Каталог", en: "Catalog", uz: "Katalog" } },
  { href: "/services", label: { ru: "Услуги", en: "Services", uz: "Xizmatlar" } },
  { href: "/contacts", label: { ru: "Контакты", en: "Contacts", uz: "Kontaktlar" } },
];

/** Pick a localized value from a {ru,en,uz} json field (or a plain string). */
export function pick<T extends Partial<Record<Lang, string>>>(v: T | string | null | undefined, lang: Lang = DEFAULT_LANG): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v[lang] || v.ru || v.en || v.uz || "";
}
