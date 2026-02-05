import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Search,
  Filter,
  Heart,
  Eye,
  Loader2,
  Package,
  Menu,
} from "lucide-react";
import { useProducts, type Product } from "@/hooks/useProducts";
import { useManufacturers } from "@/hooks/useManufacturers";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "sonner";
import { getCountryFlag, getCountryName } from "@/utils/countries";
import QuoteRequestForm from "@/components/forms/QuoteRequestForm";
import { useTranslation } from "react-i18next";
import SEOHead from "@/components/SEO/SEOHead";
import { useCurrencyRates } from "@/hooks/useCurrencyRates";
import { toUrlSlug } from "@/lib/slugify";

// SEO-оптимизированные данные для каждой категории
const categorySeoData: Record<
  string,
  {
    title: { ru: string; en: string; uz: string };
    description: { ru: string; en: string; uz: string };
    keywords: { ru: string[]; en: string[]; uz: string[] };
    h1: { ru: string; en: string; uz: string };
  }
> = {
  all: {
    title: {
      ru: "Каталог медицинского оборудования — купить в Узбекистане | Med Service Centre",
      en: "Medical Equipment Catalog — Buy in Uzbekistan | Med Service Centre",
      uz: "Tibbiy uskunalar katalogi — O'zbekistonda sotib olish | Med Service Centre",
    },
    description: {
      ru: "Купить медицинское оборудование в Узбекистане: УЗИ аппараты, лабораторные анализаторы, хирургические системы. Продажа, аренда и сервис от Med Service Centre.",
      en: "Buy medical equipment in Uzbekistan: ultrasound machines, laboratory analyzers, surgical systems. Sales, rental and service from Med Service Centre.",
      uz: "O'zbekistonda tibbiy uskunalarni sotib oling: UZI apparatlari, laboratoriya analizatorlari. Med Service Centre'dan sotish, ijara va xizmat.",
    },
    keywords: {
      ru: ["медицинское оборудование Узбекистан", "купить медтехнику Ташкент", "аренда медицинского оборудования", "каталог медоборудования", "Med Service Centre"],
      en: ["medical equipment Uzbekistan", "buy medical devices Tashkent", "medical equipment rental", "Med Service Centre"],
      uz: ["tibbiy uskunalar O'zbekiston", "Toshkentda tibbiy asboblar sotib olish", "Med Service Centre"],
    },
    h1: {
      ru: "Каталог медицинского оборудования",
      en: "Medical Equipment Catalog",
      uz: "Tibbiy uskunalar katalogi",
    },
  },
  diagnostic: {
    title: {
      ru: "Диагностическое оборудование — купить в Ташкенте и Узбекистане",
      en: "Diagnostic Equipment — Buy in Tashkent and Uzbekistan",
      uz: "Diagnostika uskunalari — Toshkent va O'zbekistonda sotib olish",
    },
    description: {
      ru: "Купить диагностическое оборудование в Узбекистане: УЗИ аппараты, рентген системы, МРТ. Поставка, установка и сервисное обслуживание по всей стране.",
      en: "Buy diagnostic equipment in Uzbekistan: ultrasound, X-ray, MRI systems. Delivery, installation and service nationwide.",
      uz: "O'zbekistonda diagnostika uskunalarini sotib oling: UZI, rentgen, MRT tizimlari. Butun mamlakat bo'ylab yetkazib berish va xizmat.",
    },
    keywords: {
      ru: ["диагностическое оборудование Узбекистан", "купить УЗИ аппарат Ташкент", "рентген оборудование", "МРТ аппарат купить", "диагностика медтехника"],
      en: ["diagnostic equipment Uzbekistan", "buy ultrasound Tashkent", "X-ray equipment", "MRI machine"],
      uz: ["diagnostika uskunalari O'zbekiston", "UZI apparati sotib olish", "rentgen uskunalari"],
    },
    h1: {
      ru: "Диагностическое оборудование",
      en: "Diagnostic Equipment",
      uz: "Diagnostika uskunalari",
    },
  },
  laboratory: {
    title: {
      ru: "Лабораторное оборудование — купить в Ташкенте и Узбекистане",
      en: "Laboratory Equipment — Buy in Tashkent and Uzbekistan",
      uz: "Laboratoriya uskunalari — Toshkent va O'zbekistonda sotib olish",
    },
    description: {
      ru: "Купить лабораторное оборудование в Узбекистане: анализаторы крови ABL800 Flex, биохимические анализаторы, центрифуги. Гарантия и сервис.",
      en: "Buy laboratory equipment in Uzbekistan: ABL800 Flex blood analyzers, biochemical analyzers, centrifuges. Warranty and service.",
      uz: "O'zbekistonda laboratoriya uskunalarini sotib oling: ABL800 Flex qon analizatorlari, bioximik analizatorlar. Kafolat va xizmat.",
    },
    keywords: {
      ru: ["лабораторное оборудование Узбекистан", "купить анализатор крови Ташкент", "ABL800 Flex", "биохимический анализатор", "лабораторная техника"],
      en: ["laboratory equipment Uzbekistan", "buy blood analyzer Tashkent", "ABL800 Flex", "biochemical analyzer"],
      uz: ["laboratoriya uskunalari O'zbekiston", "qon analizatori sotib olish", "ABL800 Flex"],
    },
    h1: {
      ru: "Лабораторное оборудование",
      en: "Laboratory Equipment",
      uz: "Laboratoriya uskunalari",
    },
  },
  surgical: {
    title: {
      ru: "Хирургическое оборудование — купить в Ташкенте и Узбекистане",
      en: "Surgical Equipment — Buy in Tashkent and Uzbekistan",
      uz: "Jarrohlik uskunalari — Toshkent va O'zbekistonda sotib olish",
    },
    description: {
      ru: "Купить хирургическое оборудование в Узбекистане: электрохирургические аппараты BOWA ARC 400, операционные столы, светильники. Установка и обучение.",
      en: "Buy surgical equipment in Uzbekistan: BOWA ARC 400 electrosurgical units, operating tables, lights. Installation and training.",
      uz: "O'zbekistonda jarrohlik uskunalarini sotib oling: BOWA ARC 400 elektrojarrohlik apparatlari, operatsiya stollari. O'rnatish va o'qitish.",
    },
    keywords: {
      ru: ["хирургическое оборудование Узбекистан", "купить электрохирургический аппарат", "BOWA ARC 400", "операционный стол", "хирургическая техника Ташкент"],
      en: ["surgical equipment Uzbekistan", "buy electrosurgical unit", "BOWA ARC 400", "operating table"],
      uz: ["jarrohlik uskunalari O'zbekiston", "elektrojarrohlik apparati sotib olish", "BOWA ARC 400"],
    },
    h1: {
      ru: "Хирургическое оборудование",
      en: "Surgical Equipment",
      uz: "Jarrohlik uskunalari",
    },
  },
  dental: {
    title: {
      ru: "Стоматологическое оборудование — купить в Ташкенте и Узбекистане",
      en: "Dental Equipment — Buy in Tashkent and Uzbekistan",
      uz: "Stomatologik uskunalar — Toshkent va O'zbekistonda sotib olish",
    },
    description: {
      ru: "Купить стоматологическое оборудование в Узбекистане: стоматологические установки, рентген аппараты, автоклавы. Сервис и запчасти.",
      en: "Buy dental equipment in Uzbekistan: dental units, X-ray machines, autoclaves. Service and spare parts.",
      uz: "O'zbekistonda stomatologik uskunalarni sotib oling: stomatologik qurilmalar, rentgen apparatlari, avtoklavlar.",
    },
    keywords: {
      ru: ["стоматологическое оборудование Узбекистан", "купить стоматологическую установку Ташкент", "дентальный рентген", "автоклав стоматологический"],
      en: ["dental equipment Uzbekistan", "buy dental unit Tashkent", "dental X-ray", "dental autoclave"],
      uz: ["stomatologik uskunalar O'zbekiston", "stomatologik qurilma sotib olish"],
    },
    h1: {
      ru: "Стоматологическое оборудование",
      en: "Dental Equipment",
      uz: "Stomatologik uskunalar",
    },
  },
  rehabilitation: {
    title: {
      ru: "Реабилитационное оборудование — купить в Ташкенте и Узбекистане",
      en: "Rehabilitation Equipment — Buy in Tashkent and Uzbekistan",
      uz: "Reabilitatsiya uskunalari — Toshkent va O'zbekistonda sotib olish",
    },
    description: {
      ru: "Купить реабилитационное оборудование в Узбекистане: тренажёры, физиотерапевтические аппараты, массажные столы. Доставка по стране.",
      en: "Buy rehabilitation equipment in Uzbekistan: exercise machines, physiotherapy devices, massage tables. Nationwide delivery.",
      uz: "O'zbekistonda reabilitatsiya uskunalarini sotib oling: trenajyorlar, fizioterapiya apparatlari, massaj stollari.",
    },
    keywords: {
      ru: ["реабилитационное оборудование Узбекистан", "физиотерапевтическое оборудование Ташкент", "медицинские тренажёры", "реабилитация медтехника"],
      en: ["rehabilitation equipment Uzbekistan", "physiotherapy equipment Tashkent", "medical trainers"],
      uz: ["reabilitatsiya uskunalari O'zbekiston", "fizioterapiya uskunalari"],
    },
    h1: {
      ru: "Реабилитационное оборудование",
      en: "Rehabilitation Equipment",
      uz: "Reabilitatsiya uskunalari",
    },
  },
  monitoring: {
    title: {
      ru: "Мониторинговое оборудование — купить в Ташкенте и Узбекистане",
      en: "Patient Monitoring Equipment — Buy in Tashkent and Uzbekistan",
      uz: "Monitoring uskunalari — Toshkent va O'zbekistonda sotib olish",
    },
    description: {
      ru: "Купить мониторинговое оборудование в Узбекистане: мониторы пациента, пульсоксиметры, ЭКГ аппараты. Гарантия и техподдержка.",
      en: "Buy patient monitoring equipment in Uzbekistan: patient monitors, pulse oximeters, ECG machines. Warranty and support.",
      uz: "O'zbekistonda monitoring uskunalarini sotib oling: bemor monitorlari, pulsoksimetrlar, EKG apparatlari.",
    },
    keywords: {
      ru: ["мониторинговое оборудование Узбекистан", "монитор пациента купить Ташкент", "пульсоксиметр", "ЭКГ аппарат", "кардиомонитор"],
      en: ["patient monitoring equipment Uzbekistan", "buy patient monitor Tashkent", "pulse oximeter", "ECG machine"],
      uz: ["monitoring uskunalari O'zbekiston", "bemor monitori sotib olish"],
    },
    h1: {
      ru: "Мониторинговое оборудование",
      en: "Patient Monitoring Equipment",
      uz: "Monitoring uskunalari",
    },
  },
  sterilization: {
    title: {
      ru: "Стерилизационное оборудование — купить в Ташкенте и Узбекистане",
      en: "Sterilization Equipment — Buy in Tashkent and Uzbekistan",
      uz: "Sterilizatsiya uskunalari — Toshkent va O'zbekistonda sotib olish",
    },
    description: {
      ru: "Купить стерилизационное оборудование в Узбекистане: автоклавы, стерилизаторы, дезинфекционные камеры. Сертифицированная техника.",
      en: "Buy sterilization equipment in Uzbekistan: autoclaves, sterilizers, disinfection chambers. Certified equipment.",
      uz: "O'zbekistonda sterilizatsiya uskunalarini sotib oling: avtoklavlar, sterilizatorlar, dezinfeksiya kameralari.",
    },
    keywords: {
      ru: ["стерилизационное оборудование Узбекистан", "автоклав купить Ташкент", "стерилизатор медицинский", "дезинфекционная камера"],
      en: ["sterilization equipment Uzbekistan", "buy autoclave Tashkent", "medical sterilizer"],
      uz: ["sterilizatsiya uskunalari O'zbekiston", "avtoklav sotib olish"],
    },
    h1: {
      ru: "Стерилизационное оборудование",
      en: "Sterilization Equipment",
      uz: "Sterilizatsiya uskunalari",
    },
  },
  furniture: {
    title: {
      ru: "Медицинская мебель — купить в Ташкенте и Узбекистане",
      en: "Medical Furniture — Buy in Tashkent and Uzbekistan",
      uz: "Tibbiy mebel — Toshkent va O'zbekistonda sotib olish",
    },
    description: {
      ru: "Купить медицинскую мебель в Узбекистане: кушетки, процедурные столы, шкафы для медикаментов, кресла. Доставка и сборка.",
      en: "Buy medical furniture in Uzbekistan: examination couches, procedure tables, medicine cabinets, chairs. Delivery and assembly.",
      uz: "O'zbekistonda tibbiy mebelni sotib oling: kushetkalar, protsedura stollari, dori-darmon shkaflari.",
    },
    keywords: {
      ru: ["медицинская мебель Узбекистан", "купить кушетку Ташкент", "процедурный стол", "мебель для клиники"],
      en: ["medical furniture Uzbekistan", "buy examination couch Tashkent", "procedure table"],
      uz: ["tibbiy mebel O'zbekiston", "kushetka sotib olish"],
    },
    h1: {
      ru: "Медицинская мебель",
      en: "Medical Furniture",
      uz: "Tibbiy mebel",
    },
  },
  consumables: {
    title: {
      ru: "Расходные материалы — купить в Ташкенте и Узбекистане",
      en: "Medical Consumables — Buy in Tashkent and Uzbekistan",
      uz: "Sarf materiallari — Toshkent va O'zbekistonda sotib olish",
    },
    description: {
      ru: "Купить медицинские расходные материалы в Узбекистане: реагенты, электроды, картриджи для анализаторов. Оптовые поставки.",
      en: "Buy medical consumables in Uzbekistan: reagents, electrodes, analyzer cartridges. Wholesale supplies.",
      uz: "O'zbekistonda tibbiy sarf materiallarini sotib oling: reagentlar, elektrodlar, analizator kartrijlari.",
    },
    keywords: {
      ru: ["расходные материалы медицинские Узбекистан", "реагенты для анализаторов Ташкент", "электроды медицинские", "картриджи ABL"],
      en: ["medical consumables Uzbekistan", "analyzer reagents Tashkent", "medical electrodes"],
      uz: ["tibbiy sarf materiallari O'zbekiston", "analizator reagentlari"],
    },
    h1: {
      ru: "Расходные материалы",
      en: "Medical Consumables",
      uz: "Sarf materiallari",
    },
  },
};

// Helper to get SEO data for a category (with fallback)
const getCategorySeoData = (category: string) => {
  return categorySeoData[category] || null;
};

// Function to get category display name
const getCategoryTag = (
  category: string,
  language: "ru" | "en" | "uz",
  allCategories: Record<string, { ru: string; en: string; uz: string }>,
) => {
  return allCategories[category]?.[language] || category;
};

// Fallback categories for display
const fallbackCategories = {
  all: {
    ru: "Все категории",
    en: "All categories",
    uz: "Barcha kategoriyalar",
  },
};

const translations = {
  title: {
    ru: "Каталог медицинского оборудования",
    en: "Medical Equipment Catalog",
    uz: "Tibbiy asbob-uskunalar katalogi",
  },
  subtitle: {
    ru: "Профессиональное медицинское оборудование от ведущих производителей",
    en: "Professional medical equipment from leading manufacturers",
    uz: "Yetakchi ishlab chiqaruvchilardan professional tibbiy asbob-uskunalar",
  },
  search: {
    ru: "Поиск по каталогу...",
    en: "Search catalog...",
    uz: "Katalogda qidirish...",
  },
  category: { ru: "Категория", en: "Category", uz: "Kategoriya" },
  features: { ru: "Особенности", en: "Features", uz: "Xususiyatlar" },
  details: { ru: "Подробнее", en: "Details", uz: "Batafsil" },
  requestQuote: { ru: "Запросить КП", en: "Request Quote", uz: "KP so'rash" },
  noProducts: {
    ru: "Товары не найдены",
    en: "No products found",
    uz: "Mahsulotlar topilmadi",
  },
  loading: {
    ru: "Загружаем каталог...",
    en: "Loading catalog...",
    uz: "Katalog yuklanmoqda...",
  },
};

const Catalog = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [currentPage, setCurrentPage] = useState(1);

  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const ITEMS_PER_PAGE = 20;

  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts();
  const { categories: dbCategories, loading: categoriesLoading } =
    useCategories();
  const { manufacturers } = useManufacturers();
  const { convertToUZS, formatPrice } = useCurrencyRates();
  const baseUrl = "https://medsc.uz";

  // Helper to get manufacturer slug by ID
  const getManufacturerSlug = (manufacturerId: string | null | undefined) => {
    if (!manufacturerId) return "unknown";
    const manufacturer = manufacturers.find((m) => m.id === manufacturerId);
    const safeSlug = toUrlSlug(manufacturer?.slug);
    return safeSlug || "unknown";
  };

  const buildProductPath = (product: Product) => {
    const manufacturerSlug = getManufacturerSlug(product.manufacturer_id);
    const productSlug = product.slug || product.id;
    return manufacturerSlug && manufacturerSlug !== "unknown"
      ? `/catalog/${manufacturerSlug}/${productSlug}`
      : `/catalog/${productSlug}`;
  };

  // Update selected category when URL changes
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category") || "all";
    if (categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams, selectedCategory]);

  useEffect(() => {
    const searchFromUrl = searchParams.get("search") || "";
    setSearchTerm((prev) => (prev === searchFromUrl ? prev : searchFromUrl));
  }, [searchParams]);

  const language = (i18n.language as "ru" | "en" | "uz") || "ru";

  // Combine fallback categories with database categories
  const allCategories = {
    ...fallbackCategories,
    ...dbCategories.reduce(
      (acc, cat) => {
        acc[cat.value] = cat.name;
        return acc;
      },
      {} as Record<string, { ru: string; en: string; uz: string }>,
    ),
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description[language]
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Pagination calculations
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const loading = productsLoading || categoriesLoading;
  const error = productsError;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-lg">{translations.loading[language]}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">
            Ошибка загрузки
          </h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const categoryName = getCategoryTag(
    selectedCategory,
    language,
    allCategories,
  );

  const seoTitle =
    selectedCategory === "all"
      ? {
          ru: "Каталог медицинского оборудования в Узбекистане",
          en: "Medical Equipment Catalog in Uzbekistan",
          uz: "O‘zbekistonda tibbiy uskunalar katalogi",
        }[language]
      : `${categoryName} — медицинское оборудование в Узбекистане`;

  const seoDescription =
    selectedCategory === "all"
      ? {
          ru: "Продажа и аренда медицинского оборудования: УЗИ, анализаторы, хирургические системы. Поставка по Узбекистану.",
          en: "Medical equipment sales and rental in Uzbekistan.",
          uz: "O‘zbekistonda tibbiy uskunalarni sotish va ijaraga berish.",
        }[language]
      : `${categoryName}. Продажа, сервис и аренда медицинского оборудования по Узбекистану.`;

  const seoKeywords =
    selectedCategory === "all"
      ? [
          "медицинское оборудование Узбекистан",
          "купить медтехнику Ташкент",
          "аренда медицинского оборудования",
          "каталог медоборудования",
          "Med Service Centre",
        ]
      : [
          `${categoryName} оборудование`,
          `купить ${categoryName.toLowerCase()}`,
          "медицинское оборудование Узбекистан",
          "Med Service Centre",
        ];

  // Structured data для каталога
  const catalogSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seoTitle,
    description: seoDescription,
    url: `https://medsc.uz/catalog${selectedCategory !== "all" ? `?category=${selectedCategory}` : ""}`,
    isPartOf: {
      "@type": "WebSite",
      name: "Med Service Centre",
      url: "https://medsc.uz",
    },
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: currentProducts.map((product, index) => {
      const productPath = buildProductPath(product);
      const productUrl = `${baseUrl}${productPath}`;
      const productImage = product.images?.cover || null;
      const productImageUrl = productImage
        ? productImage.startsWith("http")
          ? productImage
          : `${baseUrl}${productImage}`
        : undefined;
      return {
        "@type": "ListItem",
        position: startIndex + index + 1,
        item: {
          // Use WebPage here to avoid Product rich-result errors when price/offers are absent.
          "@type": "WebPage",
          name: product.name[language],
          url: productUrl,
          image: productImageUrl,
        },
      };
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords.join(", ")}
        canonical={`https://medsc.uz/catalog${selectedCategory !== "all" ? `?category=${selectedCategory}` : ""}`}
        type="website"
        structuredData={[catalogSchema, itemListSchema]}
      />
      {/* Header */}
      <div
        className="relative py-16 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/lovable-uploads/4c70d2a2-2735-43a5-904b-62be351fa867.png')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
            {translations.title[language]}
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            {translations.subtitle[language]}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-card rounded-lg border p-6 sticky top-8">
              <h3 className="font-semibold text-lg mb-4">
                {translations.category[language]}
              </h3>
              <nav className="space-y-2">
                {Object.entries(allCategories).map(([key, value]) => (
                  <Link
                    key={key}
                    to={key === "all" ? "/catalog" : `/catalog?category=${key}`}
                    onClick={() => setSelectedCategory(key)}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm leading-snug transition-colors ${
                      selectedCategory === key
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {value[language]}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Search and Mobile Category Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={translations.search[language]}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Mobile Category Filter */}
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Menu className="h-4 w-4 mr-2" />
                      {translations.category[language]}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <div className="py-6">
                      <h3 className="font-semibold text-lg mb-4">
                        {translations.category[language]}
                      </h3>
                      <nav className="space-y-2">
                        {Object.entries(allCategories).map(([key, value]) => (
                          <Link
                            key={key}
                            to={
                              key === "all"
                                ? "/catalog"
                                : `/catalog?category=${key}`
                            }
                            onClick={() => {
                              setSelectedCategory(key);
                              // Close sheet after selection
                            }}
                            className={`block w-full text-left px-3 py-2 rounded-md text-sm leading-snug transition-colors ${
                              selectedCategory === key
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            }`}
                          >
                            {value[language]}
                          </Link>
                        ))}
                      </nav>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Products Grid */}
            {currentProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">
                  {translations.noProducts[language]}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {currentProducts.map((product) => {
                    const productUrl = buildProductPath(product);
                    return (
                      <Card
                        key={product.id}
                        className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                      >
                        <Link
                          to={productUrl}
                          className="relative overflow-hidden rounded-t-lg aspect-[1080/1350] block"
                          aria-label={`${translations.details[language]}: ${product.name[language]}`}
                        >
                          {product.images?.cover ? (
                            <img
                              src={product.images.cover}
                              alt={product.name[language]}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Package className="w-16 h-16 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute top-4 left-4">
                            <Badge variant="default">
                              {getCategoryTag(
                                product.category,
                                language,
                                allCategories,
                              )}
                            </Badge>
                          </div>
                        </Link>

                        <CardHeader className="flex-grow">
                          <div className="flex items-start justify-between mb-2">
                            <CardTitle className="text-sm sm:text-lg flex-1 line-clamp-2">
                              <Link
                                to={productUrl}
                                className="hover:underline"
                                aria-label={`${translations.details[language]}: ${product.name[language]}`}
                              >
                                {product.name[language]}
                              </Link>
                            </CardTitle>
                            {product.country && (
                              <div className="bg-black text-white text-xs px-2 py-1 rounded-sm flex items-center gap-1 ml-2 whitespace-nowrap">
                                <span className="text-sm">
                                  {getCountryFlag(product.country)}
                                </span>
                                <span className="hidden sm:inline">
                                  {getCountryName(product.country, language)}
                                </span>
                              </div>
                            )}
                          </div>
                          {/* Hide description on mobile, show on larger screens */}
                          <CardDescription className="hidden sm:block">
                            {product.description[language]}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="flex flex-col justify-end mt-auto">
                          {/* Price Display */}
                          {product.price && product.currency && (
                            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-primary">
                                  {formatPrice(product.price, product.currency)}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {product.currency}
                                </span>
                              </div>
                              {product.currency !== "UZS" && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  ≈{" "}
                                  {formatPrice(
                                    convertToUZS(
                                      parseFloat(product.price),
                                      product.currency,
                                    ).toString(),
                                    "UZS",
                                  )}{" "}
                                  UZS
                                </div>
                              )}
                            </div>
                          )}

                          {/* Hide features on mobile, show on larger screens */}
                          {product.features &&
                            product.features[language] &&
                            product.features[language].length > 0 && (
                              <div className="mb-4 hidden sm:block">
                                <h4 className="font-medium mb-2">
                                  {translations.features[language]}:
                                </h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {product.features[language].map(
                                    (feature, index) => (
                                      <li
                                        key={index}
                                        className="flex items-center"
                                      >
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                                        {feature}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}

                          <div className="flex flex-col gap-2">
                            <Button
                              asChild
                              className="w-full text-xs sm:text-sm"
                            >
                              <Link
                                to={productUrl}
                                aria-label={`${translations.details[language]}: ${product.name[language]}`}
                              >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                {translations.details[language]}
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full text-xs sm:text-sm"
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowQuoteForm(true);
                              }}
                            >
                              {translations.requestQuote[language]}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) {
                                setCurrentPage(currentPage - 1);
                              }
                            }}
                            className={
                              currentPage <= 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>

                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < totalPages) {
                                setCurrentPage(currentPage + 1);
                              }
                            }}
                            className={
                              currentPage >= totalPages
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quote Request Form */}
      {showQuoteForm && (
        <QuoteRequestForm
          language={language}
          product={selectedProduct}
          onClose={() => {
            setShowQuoteForm(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default Catalog;
