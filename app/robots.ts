import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://medsc.uz";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // ?category= и ?manufacturer= БОЛЬШЕ НЕ БЛОКИРУЕМ: теперь они отдают 301 на
      // ЧПУ-страницы (см. redirects в next.config). Закрытый в robots редирект
      // Google прочитать не может — вес со старых фасетных URL просто терялся бы.
      // ?search= и ?page= остаются закрытыми: это бесконечные комбинации без
      // собственного контента, настоящая краулинговая ловушка.
      disallow: ["/admin", "/auth", "/*?search=", "/*?page="],
    },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
