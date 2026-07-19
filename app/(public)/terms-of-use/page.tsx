import type { Metadata } from "next";
import { SITE_URL } from "~/shared/config/site";
import { socialMeta } from "~/shared/config/seo";
import { LegalDocView } from "~/widgets/legal/legal-doc-view";
import { TERMS_DOCS } from "~/widgets/legal/legal-content";

// Метаданные — на языке по умолчанию (RU): страница пререндерится статически,
// перевод контента применяет клиентский LegalDocView (как на всём сайте).
const title = "Условия использования";
const description =
  "Условия использования сайта medsc.uz: назначение сайта, права и обязанности пользователя, интеллектуальная собственность и ограничение ответственности.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/terms-of-use` },
  robots: { index: true, follow: true },
  ...socialMeta({ title, description, url: `${SITE_URL}/terms-of-use` }),
};

export default function TermsOfUsePage() {
  const canonical = `${SITE_URL}/terms-of-use`;
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url: canonical,
      inLanguage: "ru",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Условия использования", item: canonical },
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
        docs={TERMS_DOCS}
        pdfHref="/documents/medsc-terms-of-use.pdf"
        pdfFileName="MEDSC — Условия использования.pdf"
      />
    </div>
  );
}
