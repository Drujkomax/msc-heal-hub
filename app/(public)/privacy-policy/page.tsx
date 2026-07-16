import type { Metadata } from "next";
import { SITE_URL } from "~/shared/config/site";
import { socialMeta } from "~/shared/config/seo";
import { LegalDocView } from "~/widgets/legal/legal-doc-view";
import { PRIVACY_DOCS } from "~/widgets/legal/legal-content";

// Метаданные — на языке по умолчанию (RU): страница пререндерится статически,
// перевод контента применяет клиентский PrivacyPolicyView (как на всём сайте).
export const metadata: Metadata = {
  title: "Политика конфиденциальности — Med Service Centre",
  description:
    "Политика конфиденциальности Med Service Centre. Информация о сборе, обработке и защите персональных данных пользователей.",
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
  robots: { index: true, follow: true },
  ...socialMeta({
    title: "Политика конфиденциальности — Med Service Centre",
    description:
      "Политика конфиденциальности Med Service Centre. Информация о сборе, обработке и защите персональных данных пользователей.",
    url: `${SITE_URL}/privacy-policy`,
  }),
};

export default function PrivacyPolicyPage() {
  const canonical = `${SITE_URL}/privacy-policy`;
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Политика конфиденциальности — Med Service Centre",
      description:
        "Политика конфиденциальности Med Service Centre. Информация о сборе, обработке и защите персональных данных пользователей.",
      url: canonical,
      inLanguage: "ru",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Политика конфиденциальности", item: canonical },
      ],
    },
  ];
  return (
    <div className="bg-background py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <LegalDocView
        docs={PRIVACY_DOCS}
        pdfHref="/documents/medsc-privacy-policy.pdf"
        pdfFileName="MEDSC — Политика конфиденциальности.pdf"
      />
    </div>
  );
}
