import SEOHead from "@/components/SEO/SEOHead";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
const Cases = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background py-20">
      <SEOHead
        title={t("pages.cases.seo.title")}
        description={t("pages.cases.seo.description")}
        keywords={t("pages.cases.seo.keywords")}
        type="website"
      />
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-heading font-bold text-foreground mb-4">{t("pages.cases.title")}</h1>
        <p className="text-lg text-muted-foreground mb-8">{t("pages.cases.description")}</p>
        <Link
          to="/catalog"
          className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-msc-accent text-white font-semibold hover:bg-msc-accent/90 transition-colors"
        >
          {t("pages.cases.cta")}
        </Link>
      </div>
    </div>
  );
};

export default Cases;

