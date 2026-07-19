"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { imageSrc, imageUrl, BLUR_DATA_URL } from "~/shared/config/site";
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
  Eye,
  Package,
  Menu,
} from "lucide-react";
import type { Product } from "@/hooks/useProducts";
import { getCountryFlag, getCountryName } from "@/utils/countries";
import dynamic from "next/dynamic";
// Форма КП открывается только по клику — не тащим её в первый бандл каталога
const QuoteRequestForm = dynamic(() => import("@/components/forms/QuoteRequestForm"), { ssr: false });
import { useT, useLang } from "~/shared/i18n/i18n-provider";
import { useCurrencyRates } from "@/hooks/useCurrencyRates";
import { toUrlSlug } from "@/lib/slugify";

// Query-параметры читаем ТОЛЬКО после монтирования, а не через useSearchParams()
// в теле компонента. useSearchParams() помечает поддерево как зависящее от запроса,
// и при пререндере Next.js отдаёт вместо него Suspense-fallback — в HTML не попадали
// ни <h1>, ни карточки товаров. Из-за этого все категорийные страницы висели в
// Search Console как «Обнаружена, не проиндексирована», а /catalog отдавал 0 ссылок
// на товары. Первый рендер теперь совпадает с серверным (фильтры из props), а URL
// применяется уже на клиенте — фильтрация для посетителя работает как раньше.
// Выбор формы числительного: 1 позиция, 2 позиции, 5 позиций, 11 позиций, 21 позиция.
function plural(n: number, forms: readonly [string, string, string]): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return forms[2];
  const mod10 = n % 10;
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}

// Клиентская навигация Next (<Link href="/catalog?category=X">) меняет адрес через
// history.pushState, а он, в отличие от кнопки «назад», НЕ порождает popstate.
// Поэтому одного popstate мало: переход по ссылке со страницы, где виджет уже
// смонтирован, менял URL, но не фильтр. Патчим history один раз на всё приложение
// и рассылаем собственное событие.
const URL_CHANGE = "medsc:urlchange";

function patchHistoryOnce() {
  const w = window as Window & { __medscHistoryPatched?: boolean };
  if (w.__medscHistoryPatched) return;
  w.__medscHistoryPatched = true;
  for (const method of ["pushState", "replaceState"] as const) {
    const original = history[method];
    history[method] = function (this: History, ...args: Parameters<History["pushState"]>) {
      const result = original.apply(this, args);
      window.dispatchEvent(new Event(URL_CHANGE));
      return result;
    };
  }
}

function useUrlQuery() {
  // Храним строку, а не URLSearchParams: новый объект на каждое событие заставлял бы
  // эффекты ниже перезапускаться даже когда адрес не менялся.
  const [search, setSearch] = useState<string | null>(null);
  useEffect(() => {
    patchHistoryOnce();
    const read = () => setSearch(window.location.search);
    read();
    window.addEventListener("popstate", read);
    window.addEventListener(URL_CHANGE, read);
    return () => {
      window.removeEventListener("popstate", read);
      window.removeEventListener(URL_CHANGE, read);
    };
  }, []);
  return useMemo(
    () => (search === null ? null : new URLSearchParams(search)),
    [search],
  );
}

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
  // Для sr-only заголовка сетки: «Диагностическое оборудование — 20 позиций».
  // В русском форма зависит от числа (1 позиция / 2 позиции / 5 позиций),
  // поэтому три варианта; в en/uz склонения нет — повторяем одну форму.
  positions: {
    ru: ["позиция", "позиции", "позиций"],
    en: ["item", "items", "items"],
    uz: ["ta mahsulot", "ta mahsulot", "ta mahsulot"],
  },
  loading: {
    ru: "Загружаем каталог...",
    en: "Loading catalog...",
    uz: "Katalog yuklanmoqda...",
  },
};

export function CatalogView({
  products,
  categories,
  manufacturers,
  initialCategory,
  initialManufacturer,
}: {
  products: any[];
  categories: any[];
  manufacturers: any[];
  initialCategory?: string;
  initialManufacturer?: string;
}) {
  const searchParams = useUrlQuery();
  // Начальное состояние — только из props, чтобы серверный и первый клиентский
  // рендер совпадали. Значения из URL подхватываются эффектами ниже.
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory ?? "all",
  );
  const [selectedManufacturer, setSelectedManufacturer] = useState(
    initialManufacturer ?? "all",
  );
  const [currentPage, setCurrentPage] = useState(1);

  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const ITEMS_PER_PAGE = 20;

  const dbCategories = categories;
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
    if (!searchParams) return; // до монтирования query ещё не прочитан
    if (initialCategory) return; // dedicated /catalog/category/[slug] page owns the filter
    const categoryFromUrl = searchParams.get("category") || "all";
    if (categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams, selectedCategory, initialCategory]);

  useEffect(() => {
    if (!searchParams) return;
    const searchFromUrl = searchParams.get("search") || "";
    setSearchTerm((prev) => (prev === searchFromUrl ? prev : searchFromUrl));
  }, [searchParams]);

  useEffect(() => {
    if (!searchParams) return;
    if (initialManufacturer) return; // dedicated /catalog/manufacturer/[slug] page owns the filter
    const manufacturerFromUrl = searchParams.get("manufacturer") || "all";
    if (manufacturerFromUrl !== selectedManufacturer) {
      setSelectedManufacturer(manufacturerFromUrl);
    }
  }, [searchParams, selectedManufacturer, initialManufacturer]);

  const language = useLang() as "ru" | "en" | "uz";
  const t = useT();

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

  const manufacturerNameById = new Map(
    manufacturers.map((manufacturer) => {
      const name = manufacturer.name;
      if (typeof name === "object") {
        const objName = name as Record<string, string>;
        return [
          manufacturer.id,
          objName[language] || objName.ru || objName.en || "",
        ] as const;
      }
      return [manufacturer.id, String(name)] as const;
    }),
  );

  const selectedManufacturerEntity =
    selectedManufacturer === "all"
      ? null
      : manufacturers.find(
          (manufacturer) =>
            toUrlSlug(manufacturer.slug) === toUrlSlug(selectedManufacturer),
        ) || null;
  const selectedManufacturerId = selectedManufacturerEntity?.id || null;

  const filteredProducts = products.filter((product) => {
    const manufacturerNameForSearch =
      manufacturerNameById.get(product.manufacturer_id || "") || "";
    const matchesSearch =
      product.name[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description[language]
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      manufacturerNameForSearch
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesManufacturer = selectedManufacturerId
      ? product.manufacturer_id === selectedManufacturerId
      : true;
    return matchesSearch && matchesCategory && matchesManufacturer;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedManufacturer]);

  // Scroll to top when page changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  // Pagination calculations
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const categoryName = getCategoryTag(
    selectedCategory,
    language,
    allCategories,
  );

  const manufacturerName = (() => {
    if (!selectedManufacturerEntity?.name) return "";
    const name = selectedManufacturerEntity.name;
    if (typeof name === "object") {
      const objName = name as Record<string, string>;
      return objName[language] || objName.ru || objName.en || "";
    }
    return String(name);
  })();

  const locationByLanguage = {
    ru: "в Узбекистане и Ташкенте",
    en: "in Uzbekistan and Tashkent",
    uz: "O‘zbekistonda va Toshkentda",
  }[language];

  const seoDescription = (() => {
    if (selectedCategory !== "all" && manufacturerName) {
      return language === "ru"
        ? `${categoryName} ${manufacturerName} — продажа, сервис и аренда медицинского оборудования ${locationByLanguage}.`
        : language === "en"
          ? `${categoryName} ${manufacturerName} — sales, service, and rental of medical equipment ${locationByLanguage}.`
          : `${categoryName} ${manufacturerName} — tibbiy uskunalarni sotish, servis va ijara ${locationByLanguage}.`;
    }
    if (selectedCategory !== "all") {
      return language === "ru"
        ? `${categoryName}. Продажа, сервис и аренда медицинского оборудования ${locationByLanguage}.`
        : language === "en"
          ? `${categoryName}. Medical equipment sales, service, and rental ${locationByLanguage}.`
          : `${categoryName}. Tibbiy uskunalarni sotish, servis va ijara ${locationByLanguage}.`;
    }
    if (manufacturerName) {
      return language === "ru"
        ? `${manufacturerName} — медицинское оборудование: продажа, аренда и сервис ${locationByLanguage}.`
        : language === "en"
          ? `${manufacturerName} — medical equipment: sales, rental, and service ${locationByLanguage}.`
          : `${manufacturerName} — tibbiy uskunalar: sotuv, ijara va servis ${locationByLanguage}.`;
    }
    return {
      ru: "Продажа и аренда медицинского оборудования: УЗИ, анализаторы, хирургические системы. Поставка по Узбекистану и Ташкенту.",
      en: "Medical equipment sales and rental in Uzbekistan and Tashkent.",
      uz: "O‘zbekistonda va Toshkentda tibbiy uskunalarni sotish va ijaraga berish.",
    }[language];
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="relative py-16">
        <Image
          src="/images/hero-catalog.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
            {selectedCategory !== "all" && manufacturerName
              ? `${categoryName} ${manufacturerName}`
              : selectedCategory !== "all"
                ? categoryName
                : manufacturerName
                  ? manufacturerName
                  : translations.title[language]}
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            {selectedCategory === "all" && !manufacturerName
              ? translations.subtitle[language]
              : seoDescription}
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav aria-label="Хлебные крошки" className="container mx-auto px-4 pt-4 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:underline">
              {language === "ru" ? "Главная" : language === "en" ? "Home" : "Bosh sahifa"}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/catalog" className="hover:underline">
              {language === "ru" ? "Каталог" : language === "en" ? "Catalog" : "Katalog"}
            </Link>
          </li>
          {selectedCategory !== "all" && (
            <>
              <li aria-hidden="true">/</li>
              <li className="text-foreground">{categoryName}</li>
            </>
          )}
          {manufacturerName && (
            <>
              <li aria-hidden="true">/</li>
              <li className="text-foreground">{manufacturerName}</li>
            </>
          )}
        </ol>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-card rounded-lg border p-6 sticky top-8">
              {/* h2, а не h3: заголовки карточек товаров — это h3, и без этого
                  уровня структура шла h1 → h3 с пропуском ступени. */}
              <h2 className="font-semibold text-lg mb-4">
                {translations.category[language]}
              </h2>
              <nav aria-label="Категории оборудования" className="space-y-2">
                {(
                  Object.entries(allCategories) as [
                    string,
                    { ru: string; en: string; uz: string },
                  ][]
                ).map(([key, value]) => (
                  <Link
                    key={key}
                    href={
                      key === "all"
                        ? "/catalog"
                        : `/catalog/category/${encodeURIComponent(key)}`
                    }
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
                  aria-label={translations.search[language]}
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
                      <h2 className="font-semibold text-lg mb-4">
                        {translations.category[language]}
                      </h2>
                      <nav aria-label="Категории оборудования" className="space-y-2">
                        {(
                  Object.entries(allCategories) as [
                    string,
                    { ru: string; en: string; uz: string },
                  ][]
                ).map(([key, value]) => (
                          <Link
                            key={key}
                            href={
                              key === "all"
                                ? "/catalog"
                                : `/catalog/category/${encodeURIComponent(key)}`
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
                {/* Заголовок самой выдачи: карточки — h3, и без него сетка висела
                    в структуре без родителя. Видимого заголовка в макете нет,
                    поэтому только для скринридеров и поисковика. */}
                <h2 className="sr-only">
                  {selectedCategory !== "all" && manufacturerName
                    ? `${categoryName} ${manufacturerName}`
                    : selectedCategory !== "all"
                      ? categoryName
                      : manufacturerName
                        ? manufacturerName
                        : translations.title[language]}
                  {` — ${totalItems} ${plural(
                    totalItems,
                    translations.positions[language] as [string, string, string],
                  )}`}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {currentProducts.map((product) => {
                    const productUrl = buildProductPath(product);
                    return (
                      <Card
                        key={product.id}
                        className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                        itemScope
                        itemType="https://schema.org/Product"
                      >
                        {/* Microdata for Yandex listing (it ignores JSON-LD). */}
                        {product.images?.cover && (
                          <meta itemProp="image" content={imageUrl(product.images.cover)} />
                        )}
                        <Link
                          href={productUrl}
                          className="relative overflow-hidden rounded-t-lg aspect-[1080/1350] block"
                          aria-label={`${translations.details[language]}: ${product.name[language]}`}
                        >
                          {product.images?.cover ? (
                            <Image
                              src={imageSrc(product.images.cover)!}
                              alt={product.name[language]}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              placeholder="blur"
                              blurDataURL={BLUR_DATA_URL}
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
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
                                href={productUrl}
                                className="hover:underline"
                                aria-label={`${translations.details[language]}: ${product.name[language]}`}
                                itemProp="url"
                              >
                                <span itemProp="name">{product.name[language]}</span>
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
                            <div
                              className="mb-4 p-3 bg-muted/50 rounded-lg"
                              itemProp="offers"
                              itemScope
                              itemType="https://schema.org/Offer"
                            >
                              <meta itemProp="price" content={product.price} />
                              <meta itemProp="priceCurrency" content={product.currency} />
                              <link itemProp="availability" href="https://schema.org/InStock" />
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
                                    (feature: string, index: number) => (
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
                                href={productUrl}
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
                            label={t('common.previous')}
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
                            label={t('common.next')}
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
}
