"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FileText,
  Package,
  Globe,
} from "lucide-react";
import dynamic from "next/dynamic";
const QuoteRequestForm = dynamic(() => import("@/components/forms/QuoteRequestForm"), { ssr: false });
import { useT, useLang } from "~/shared/i18n/i18n-provider";
import { getCountryName, getCountryFlag } from "@/utils/countries";
import { useCurrencyRates } from "@/hooks/useCurrencyRates";
import { toUrlSlug } from "@/lib/slugify";
import { supabase } from "@/integrations/supabase/client";
import Image from "next/image";
import { imageSrc, imageUrl, BLUR_DATA_URL } from "~/shared/config/site";

const getCategoryLabel = (category: string, language: "ru" | "en" | "uz") => {
  const categoryLabels = {
    diagnostic: { ru: "Диагностическое", en: "Diagnostic", uz: "Diagnostika" },
    surgical: { ru: "Хирургическое", en: "Surgical", uz: "Jarrohlik" },
    monitoring: { ru: "Мониторинг", en: "Monitoring", uz: "Monitoring" },
    laboratory: { ru: "Лабораторное", en: "Laboratory", uz: "Laboratoriya" },
    rehabilitation: {
      ru: "Реабилитационное",
      en: "Rehabilitation",
      uz: "Reabilitatsiya",
    },
    dental: { ru: "Стоматологическое", en: "Dental", uz: "Stomatologiya" },
    ophthalmology: {
      ru: "Офтальмологическое",
      en: "Ophthalmology",
      uz: "Oftalmologiya",
    },
    furniture: {
      ru: "Медицинская мебель",
      en: "Medical Furniture",
      uz: "Tibbiy mebel",
    },
  };

  return (
    categoryLabels[category as keyof typeof categoryLabels]?.[language] ||
    category
  );
};

const translations = {
  backToCatalog: {
    ru: "Назад к каталогу",
    en: "Back to Catalog",
    uz: "Katalogga qaytish",
  },
  inStock: { ru: "В наличии", en: "In Stock", uz: "Mavjud" },
  outOfStock: { ru: "Под заказ", en: "On Order", uz: "Buyurtma bo'yicha" },
  features: { ru: "Характеристики", en: "Features", uz: "Xususiyatlar" },
  category: { ru: "Категория", en: "Category", uz: "Kategoriya" },
  requestQuote: { ru: "Запросить КП", en: "Request Quote", uz: "KP so'rash" },
  requestQuoteTitle: {
    ru: "Запрос коммерческого предложения",
    en: "Request Commercial Proposal",
    uz: "Tijoriy taklif so'rovi",
  },
  requestQuoteDesc: {
    ru: "Заполните форму и мы свяжемся с вами в ближайшее время",
    en: "Fill out the form and we will contact you soon",
    uz: "Shaklni to'ldiring va biz tez orada siz bilan bog'lanamiz",
  },
  companyName: {
    ru: "Название организации",
    en: "Company Name",
    uz: "Tashkilot nomi",
  },
  contactPerson: {
    ru: "Контактное лицо",
    en: "Contact Person",
    uz: "Aloqa shaxsi",
  },
  phone: { ru: "Телефон", en: "Phone", uz: "Telefon" },
  email: { ru: "Email", en: "Email", uz: "Email" },
  message: {
    ru: "Дополнительные пожелания",
    en: "Additional Requirements",
    uz: "Qo'shimcha talablar",
  },
  submit: {
    ru: "Отправить заявку",
    en: "Submit Request",
    uz: "So'rov yuborish",
  },
  successMessage: {
    ru: "Заявка отправлена! Мы свяжемся с вами в ближайшее время.",
    en: "Request sent! We will contact you soon.",
    uz: "So'rov yuborildi! Biz tez orada siz bilan bog'lanamiz.",
  },
  productNotFound: {
    ru: "Товар не найден",
    en: "Product not found",
    uz: "Mahsulot topilmadi",
  },
  loading: {
    ru: "Загружаем товар...",
    en: "Loading product...",
    uz: "Mahsulot yuklanmoqda...",
  },
  error: { ru: "Ошибка загрузки", en: "Loading error", uz: "Yuklash xatosi" },
  keyFeatures: {
    ru: "Ключевые особенности",
    en: "Key Features",
    uz: "Asosiy xususiyatlar",
  },
  manufacturer: {
    ru: "Производитель",
    en: "Manufacturer",
    uz: "Ishlab chiqaruvchi",
  },
  country: { ru: "Страна", en: "Country", uz: "Mamlakat" },
};

const toImageUrl = (img: string | null | undefined): string | null =>
  imageSrc(img) ?? null;

export function ProductDetailView({
  product,
  manufacturers,
  related,
}: {
  product: any;
  manufacturers: any[];
  related: any[];
}) {
  const t = useT();
  const language = (useLang() as "ru" | "en" | "uz") || "ru";
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { convertToUZS, formatPrice } = useCurrencyRates();

  // Счётчик просмотров для «Конверсии товаров» в админ-дашборде. Механизм
  // (rpc + таблица conversion_analytics) существовал, но с сайта не вызывался —
  // из-за этого метрика всегда была 0. Один визит = один просмотр (sessionStorage).
  useEffect(() => {
    if (!product?.id) return;
    const key = `msc_viewed_${product.id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch { /* private mode — считаем каждый раз */ }
    supabase.rpc('increment_product_views', { product_id: product.id }).catch(() => {});
    supabase.rpc('update_conversion_analytics', {
      p_product_id: product.id,
      p_date: new Date().toISOString().slice(0, 10),
    }).catch(() => {});
  }, [product?.id]);

  const manufacturer = manufacturers.find(
    (m) => m.id === product?.manufacturer_id,
  );
  const countryCode = manufacturer?.country_code || product?.country || null;

  const productName = (() => {
    if (typeof product.name === "object" && product.name !== null) {
      const objName = product.name as Record<string, string>;
      return (
        objName[language] ||
        objName.ru ||
        objName.en ||
        "Медицинское оборудование"
      );
    }
    return String(product.name) || "Медицинское оборудование";
  })();

  const productDescription = (() => {
    if (
      typeof product.description === "object" &&
      product.description !== null
    ) {
      const objDesc = product.description as Record<string, string>;
      return objDesc[language] || objDesc.ru || objDesc.en || "";
    }
    return String(product.description) || "";
  })();

  const manufacturerSlugSafe = toUrlSlug(manufacturer?.slug);
  const categoryLabel = getCategoryLabel(product.category, language);
  const categoryPath = `/catalog/category/${encodeURIComponent(
    product.category,
  )}`;

  const seoBlurb =
    language === "ru"
      ? `${productName} доступен для клиник Узбекистана: продажа, аренда и сервисное сопровождение от Med Service Centre.`
      : language === "en"
        ? `${productName} is available for clinics in Uzbekistan with sales, rental, and service support from Med Service Centre.`
        : `${productName} O‘zbekiston klinikalari uchun mavjud: sotuv, ijara va Med Service Centre servis xizmati.`;

  const coverUrl = toImageUrl(product.images?.cover);
  const selectedImageUrl = toImageUrl(selectedImage);

  const relatedPath = (p: any) => {
    const m = manufacturers.find((x) => x.id === p.manufacturer_id);
    const ms = toUrlSlug(m?.slug);
    const ps = p.slug || p.id;
    return ms && ms !== "unknown" ? `/catalog/${ms}/${ps}` : `/catalog/${ps}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Microdata: Yandex reads itemprop BreadcrumbList (it ignores JSON-LD). */}
        <nav
          aria-label="Хлебные крошки"
          className="text-sm text-muted-foreground mb-4"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          <span
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <Link href="/catalog" className="hover:underline" itemProp="item">
              <span itemProp="name">
                {language === "ru"
                  ? "Каталог"
                  : language === "en"
                    ? "Catalog"
                    : "Katalog"}
              </span>
            </Link>
            <meta itemProp="position" content="1" />
          </span>
          <span className="mx-2">/</span>
          <span
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <Link href={categoryPath} className="hover:underline" itemProp="item">
              <span itemProp="name">{categoryLabel}</span>
            </Link>
            <meta itemProp="position" content="2" />
          </span>
          <span className="mx-2">/</span>
          <span
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <span className="text-foreground" itemProp="name">
              {productName}
            </span>
            <meta itemProp="position" content="3" />
          </span>
        </nav>
        <Button
          variant="outline"
          onClick={() => router.push("/catalog")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {translations.backToCatalog[language]}
        </Button>

        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          itemScope
          itemType="https://schema.org/Product"
        >
          {/* Microdata for Yandex (ignores JSON-LD): absolute image + brand. */}
          {product.images?.cover && (
            <meta itemProp="image" content={imageUrl(product.images.cover)} />
          )}
          {manufacturer?.name && (
            // hidden: иначе span становится невидимой ПЕРВОЙ ячейкой grid-а и
            // сдвигает галерею вправо, а текст — на следующий ряд
            <span itemProp="brand" itemScope itemType="https://schema.org/Brand" className="hidden">
              <meta itemProp="name" content={manufacturer.name} />
            </span>
          )}
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              {coverUrl || selectedImageUrl ? (
                <Image
                  src={(selectedImageUrl || coverUrl)!}
                  alt={productName}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-muted-foreground" />
                </div>
              )}
              {/* Кнопка «В избранное» убрана: была заглушкой (локальный стейт
                  без сохранения и без страницы избранного) */}
            </div>

            {/* Gallery */}
            {product.images?.gallery && product.images.gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {/* Cover as first thumbnail */}
                {product.images.cover && (
                  <button
                    type="button"
                    aria-label={`${productName} — основное изображение`}
                    className={`relative aspect-square w-full rounded-lg overflow-hidden bg-muted cursor-pointer border-2 transition-colors ${
                      !selectedImage
                        ? "border-primary"
                        : "border-transparent hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedImage(null)}
                  >
                    {coverUrl && (
                      <Image
                        src={coverUrl}
                        alt={`${productName} - основное изображение`}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    )}
                  </button>
                )}

                {/* Gallery images */}
                {product.images.gallery.map((image: string, index: number) => (
                  <button
                    type="button"
                    key={index}
                    aria-label={`${productName} — изображение ${index + 1}`}
                    className={`relative aspect-square w-full rounded-lg overflow-hidden bg-muted cursor-pointer border-2 transition-colors ${
                      selectedImage === image
                        ? "border-primary"
                        : "border-transparent hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    {toImageUrl(image) && (
                      <Image
                        src={toImageUrl(image)!}
                        alt={`${productName} - изображение ${index + 1}`}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2" itemProp="name">
                {productName}
              </h1>
              <div className="mb-4 flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-sm">
                  {getCategoryLabel(product.category, language)}
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground mb-6" itemProp="description">
                {productDescription}
              </p>
              <p className="text-sm text-muted-foreground">{seoBlurb}</p>

              {/* Price Display */}
              {product.price && product.currency && (
                <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
                  {/* Machine-readable offer for Yandex/Google commerce ranking. */}
                  <meta itemProp="price" content={product.price} />
                  <meta itemProp="priceCurrency" content={product.currency} />
                  <link itemProp="availability" href="https://schema.org/InStock" />
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-bold text-primary">
                        {formatPrice(product.price, product.currency)}
                      </span>
                      <span className="text-xl text-muted-foreground">
                        {product.currency}
                      </span>
                    </div>
                    {product.currency !== "UZS" && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        ≈{" "}
                        {formatPrice(
                          convertToUZS(
                            parseFloat(product.price),
                            product.currency,
                          ).toString(),
                          "UZS",
                        )}{" "}
                        <span className="font-medium">UZS</span>
                        <div className="text-xs mt-1 opacity-70">
                          По курсу НБУ на сегодня
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                </div>
              )}
            </div>

            {/* Features */}
            {product.features &&
              product.features[language] &&
              product.features[language].length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium text-sm">
                            ✓
                          </span>
                        </div>
                        {translations.keyFeatures[language]}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {product.features[language].map(
                        (feature: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                          >
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span className="text-foreground leading-relaxed">
                              {feature}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Manufacturer Info */}
            {(manufacturer || product.country) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {translations.manufacturer[language]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {manufacturer ? (
                    <div className="space-y-4">
                      {manufacturer.logo_url && (
                        <div className="flex items-center gap-3 pb-3 border-b">
                          <img
                            src={manufacturer.logo_url}
                            alt={`${manufacturer.name} logo`}
                            height={48}
                            loading="lazy"
                            decoding="async"
                            className="h-12 w-auto object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="font-medium text-lg">
                          {manufacturerSlugSafe ? (
                            <Link
                              href={`/catalog/manufacturer/${encodeURIComponent(
                                manufacturerSlugSafe,
                              )}`}
                              className="hover:underline"
                            >
                              {manufacturer.name}
                            </Link>
                          ) : (
                            manufacturer.name
                          )}
                        </div>
                        {manufacturer.legal_name && (
                          <div className="text-sm text-muted-foreground">
                            {manufacturer.legal_name}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <span
                            className="text-xl leading-none inline-block"
                            style={{
                              fontFamily:
                                "Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif",
                            }}
                          >
                            {getCountryFlag(countryCode)}
                          </span>
                          <span className="font-medium">
                            {getCountryName(countryCode, language) ||
                              translations.country[language]}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : product.country ? (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span
                        className="text-xl leading-none inline-block mr-1"
                        style={{
                          fontFamily:
                            "Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif",
                        }}
                      >
                        {getCountryFlag(product.country)}
                      </span>
                      <span>{getCountryName(product.country, language)}</span>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}

            {/* CTA Button */}
            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => setIsDialogOpen(true)}
            >
              <FileText className="h-5 w-5 mr-2" />
              {translations.requestQuote[language]}
            </Button>
            {isDialogOpen && (
              <QuoteRequestForm
                language={language}
                product={product as any}
                onClose={() => setIsDialogOpen(false)}
              />
            )}
          </div>
        </div>

        {/* Related products — internal links for crawlability + UX */}
        {related && related.length > 0 && (
          <section aria-labelledby="related-heading" className="mt-12">
            <h2 id="related-heading" className="mb-6 text-2xl font-bold text-foreground">
              {language === "ru"
                ? "Похожие товары"
                : language === "en"
                  ? "Related products"
                  : "O'xshash mahsulotlar"}
            </h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {related.map((p: any) => {
                const cover = toImageUrl(p.images?.cover);
                const name =
                  typeof p.name === "object" && p.name
                    ? p.name[language] || p.name.ru
                    : String(p.name);
                return (
                  <Link
                    key={p.id}
                    href={relatedPath(p)}
                    className="group block overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-square bg-muted">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={name}
                          fill
                          sizes="(max-width: 1024px) 50vw, 25vw"
                          placeholder="blur"
                          blurDataURL={BLUR_DATA_URL}
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="mb-1 text-xs text-muted-foreground">
                        {getCategoryLabel(p.category, language)}
                      </div>
                      <div className="line-clamp-2 text-sm font-medium group-hover:underline">
                        {name}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
