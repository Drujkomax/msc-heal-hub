import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: object | object[];
}

const SEOHead = ({
  title = "Med Service Centre - Медицинское оборудование в Узбекистане",
  description = "Med Service Centre — поставщик медтехники в Узбекистане: УЗИ, анализаторы ABL800 Flex, системы BOWA ARC 400, продажа, сервис и аренда клиникам страны.",
  keywords = "медицинское оборудование Узбекистан, УЗИ аппарат Ташкент, лабораторное оборудование аренда, ABL800 Flex, хирургическое оборудование BOWA ARC 400, медицинская техника клиники Узбекистан",
  image = "/lovable-uploads/ea1f50a2-d3d1-418f-b6ce-f6e08a722162.png",
  url,
  type = "website",
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  twitterTitle,
  twitterDescription,
  twitterImage,
  noindex = false,
  nofollow = false,
  structuredData,
}: SEOHeadProps) => {
  const location = useLocation();

  // Build full URLs
  const baseUrl = "https://medsc.uz";
  const currentUrl = url || `${baseUrl}${location.pathname}${location.search}`;
  const canonicalUrl = canonical || currentUrl;
  const fullImageUrl = image?.startsWith("http") ? image : `${baseUrl}${image}`;

  // Resolve OG and Twitter values
  const resolvedOgTitle = ogTitle || title;
  const resolvedOgDescription = ogDescription || description;
  const resolvedOgImage = ogImage || fullImageUrl;
  const resolvedOgUrl = ogUrl || canonicalUrl;
  const resolvedTwitterTitle = twitterTitle || resolvedOgTitle;
  const resolvedTwitterDescription =
    twitterDescription || resolvedOgDescription;
  const resolvedTwitterImage = twitterImage || resolvedOgImage;

  // Build robots meta
  const robotsContent = [];
  if (noindex) robotsContent.push("noindex");
  if (nofollow) robotsContent.push("nofollow");
  if (robotsContent.length === 0) robotsContent.push("index", "follow");

  // Build alternate URLs for languages
  const currentUrlObject = new URL(currentUrl);
  const buildLocalizedHref = (lang: "ru" | "uz") => {
    const localized = new URL(currentUrlObject.toString());
    if (lang === "ru") {
      localized.searchParams.delete("lang");
    } else {
      localized.searchParams.set("lang", lang);
    }
    return localized.toString();
  };

  const searchParamsWithoutLang = new URLSearchParams(currentUrlObject.search);
  searchParamsWithoutLang.delete("lang");
  const searchWithoutLang = searchParamsWithoutLang.toString();
  const basePathWithSearch = `${currentUrlObject.origin}${currentUrlObject.pathname}${searchWithoutLang ? `?${searchWithoutLang}` : ""}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Med Service Centre" />
      <meta name="robots" content={robotsContent.join(", ")} />

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Alternate Languages */}
      <link rel="alternate" hrefLang="ru" href={buildLocalizedHref("ru")} />
      <link rel="alternate" hrefLang="uz" href={buildLocalizedHref("uz")} />
      <link rel="alternate" hrefLang="x-default" href={basePathWithSearch} />

      {/* Open Graph */}
      <meta property="og:title" content={resolvedOgTitle} />
      <meta property="og:description" content={resolvedOgDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={resolvedOgUrl} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:site_name" content="Med Service Centre" />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:locale:alternate" content="uz_UZ" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTwitterTitle} />
      <meta name="twitter:description" content={resolvedTwitterDescription} />
      <meta name="twitter:image" content={resolvedTwitterImage} />

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(
            Array.isArray(structuredData) ? structuredData : [structuredData],
          )}
        </script>
      )}

      {/* Organization Schema (Default) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Med Service Centre",
          description: description,
          url: baseUrl,
          logo: {
            "@type": "ImageObject",
            url: `${baseUrl}/lovable-uploads/ea1f50a2-d3d1-418f-b6ce-f6e08a722162.png`,
          },
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "sales",
            areaServed: "UZ",
            availableLanguage: ["ru", "en", "uz"],
          },
          address: {
            "@type": "PostalAddress",
            addressCountry: "UZ",
            addressRegion: "Tashkent",
          },
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;
