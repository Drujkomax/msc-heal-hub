// Site contacts entity API (FSD: entities/site-contacts).
// Reads an optional `site_contacts` row; falls back to static company facts.
import { dbSelect } from "~/shared/api/http";

export interface SiteContacts {
  id?: string;
  email: string | null;
  telegram: string | null; // handle, e.g. "@medsc_uz"
  telegram_url: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
}

export const FALLBACK_CONTACTS: SiteContacts = {
  email: "kamilov.tolib@medsc.uz",
  telegram: "@medsc_uz",
  telegram_url: "https://t.me/medsc_uz",
  phone: null,
  country: "Узбекистан",
  city: "Ташкент",
  address: null,
};

/** Fetch the single site_contacts row, merged over static fallbacks. */
export async function getSiteContacts(revalidate = 600): Promise<SiteContacts> {
  try {
    // В таблице бывает несколько строк (в т.ч. тестовый мусор) — без сортировки
    // Postgres отдаёт произвольную первую, и сайт показывал устаревшие контакты.
    // Берём последнюю отредактированную: именно её правит админка.
    const { data } = await dbSelect<Partial<SiteContacts> | null>(
      "site_contacts",
      { order: { col: "updated_at", ascending: false }, single: true },
      { revalidate },
    );
    if (!data) return FALLBACK_CONTACTS;
    return {
      ...FALLBACK_CONTACTS,
      ...Object.fromEntries(Object.entries(data).filter(([, v]) => v != null && v !== "")),
    } as SiteContacts;
  } catch {
    return FALLBACK_CONTACTS;
  }
}
