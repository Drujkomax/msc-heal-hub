import SEOHead from "@/components/SEO/SEOHead";
import { Link } from "react-router-dom";

const Cases = () => {
  return (
    <div className="min-h-screen bg-background py-20">
      <SEOHead
        title="Кейсы внедрения — Med Service Centre"
        description="Реальные кейсы поставки и запуска медицинского оборудования в клиниках Узбекистана: УЗИ, лаборатория, хирургия."
        keywords="кейсы медоборудование, внедрение медтехники, УЗИ кейсы, лабораторное оборудование кейсы, хирургическое оборудование кейсы"
        type="website"
      />
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
          Кейсы внедрения
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Скоро здесь будут опубликованы проекты по поставке и запуску медоборудования.
        </p>
        <Link
          to="/catalog"
          className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-msc-accent text-white font-semibold hover:bg-msc-accent/90 transition-colors"
        >
          Вернуться в каталог
        </Link>
      </div>
    </div>
  );
};

export default Cases;
