import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Heart, FileText, Loader2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProduct } from '@/hooks/useProducts';

interface ProductDetailProps {
  language: 'ru' | 'en' | 'uz';
}

const getCategoryLabel = (category: string, language: 'ru' | 'en' | 'uz') => {
  const categoryLabels = {
    diagnostic: { ru: 'Диагностическое', en: 'Diagnostic', uz: 'Diagnostika' },
    surgical: { ru: 'Хирургическое', en: 'Surgical', uz: 'Jarrohlik' },
    monitoring: { ru: 'Мониторинг', en: 'Monitoring', uz: 'Monitoring' },
    laboratory: { ru: 'Лабораторное', en: 'Laboratory', uz: 'Laboratoriya' },
    rehabilitation: { ru: 'Реабилитационное', en: 'Rehabilitation', uz: 'Reabilitatsiya' },
    dental: { ru: 'Стоматологическое', en: 'Dental', uz: 'Stomatologiya' },
    ophthalmology: { ru: 'Офтальмологическое', en: 'Ophthalmology', uz: 'Oftalmologiya' },
    furniture: { ru: 'Медицинская мебель', en: 'Medical Furniture', uz: 'Tibbiy mebel' }
  };
  
  return categoryLabels[category as keyof typeof categoryLabels]?.[language] || category;
};

const translations = {
  backToCatalog: { ru: "Назад к каталогу", en: "Back to Catalog", uz: "Katalogga qaytish" },
  inStock: { ru: "В наличии", en: "In Stock", uz: "Mavjud" },
  outOfStock: { ru: "Под заказ", en: "On Order", uz: "Buyurtma bo'yicha" },
  features: { ru: "Характеристики", en: "Features", uz: "Xususiyatlar" },
  category: { ru: "Категория", en: "Category", uz: "Kategoriya" },
  requestQuote: { ru: "Запросить КП", en: "Request Quote", uz: "KP so'rash" },
  requestQuoteTitle: { ru: "Запрос коммерческого предложения", en: "Request Commercial Proposal", uz: "Tijoriy taklif so'rovi" },
  requestQuoteDesc: { ru: "Заполните форму и мы свяжемся с вами в ближайшее время", en: "Fill out the form and we will contact you soon", uz: "Shaklni to'ldiring va biz tez orada siz bilan bog'lanamiz" },
  companyName: { ru: "Название организации", en: "Company Name", uz: "Tashkilot nomi" },
  contactPerson: { ru: "Контактное лицо", en: "Contact Person", uz: "Aloqa shaxsi" },
  phone: { ru: "Телефон", en: "Phone", uz: "Telefon" },
  email: { ru: "Email", en: "Email", uz: "Email" },
  message: { ru: "Дополнительные пожелания", en: "Additional Requirements", uz: "Qo'shimcha talablar" },
  submit: { ru: "Отправить заявку", en: "Submit Request", uz: "So'rov yuborish" },
  successMessage: { ru: "Заявка отправлена! Мы свяжемся с вами в ближайшее время.", en: "Request sent! We will contact you soon.", uz: "So'rov yuborildi! Biz tez orada siz bilan bog'lanamiz." },
  productNotFound: { ru: "Товар не найден", en: "Product not found", uz: "Mahsulot topilmadi" },
  loading: { ru: "Загружаем товар...", en: "Loading product...", uz: "Mahsulot yuklanmoqda..." },
  error: { ru: "Ошибка загрузки", en: "Loading error", uz: "Yuklash xatosi" }
};

const ProductDetail = ({ language }: ProductDetailProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    message: ''
  });

  const { product, loading, error } = useProduct(id || '');

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
          <h2 className="text-2xl font-bold text-destructive mb-2">{translations.error[language]}</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => navigate('/catalog')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {translations.backToCatalog[language]}
          </Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{translations.productNotFound[language]}</h1>
          <Button onClick={() => navigate('/catalog')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {translations.backToCatalog[language]}
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: translations.successMessage[language],
      description: `${product.name[language]} - ${formData.companyName}`,
    });
    setIsDialogOpen(false);
    setFormData({
      companyName: '',
      contactPerson: '',
      phone: '',
      email: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/catalog')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {translations.backToCatalog[language]}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Image */}
          <div className="relative">
            {product.images?.cover ? (
              <img
                src={product.images.cover}
                alt={product.name[language]}
                className="w-full h-96 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            ) : (
              <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
                <Package className="w-24 h-24 text-muted-foreground" />
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-background/80 backdrop-blur-sm"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart 
                  className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} 
                />
              </Button>
            </div>
            <div className="absolute top-4 left-4">
              <Badge variant={product.in_stock ? "default" : "secondary"}>
                {product.in_stock ? translations.inStock[language] : translations.outOfStock[language]}
              </Badge>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {product.name[language]}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              {product.description[language]}
            </p>
            <div className="mb-4">
              <Badge variant="outline" className="text-sm">
                {getCategoryLabel(product.category, language)}
              </Badge>
            </div>

            <div className="space-y-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    {translations.requestQuote[language]}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{translations.requestQuoteTitle[language]}</DialogTitle>
                    <DialogDescription>
                      {translations.requestQuoteDesc[language]}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="companyName">{translations.companyName[language]}</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPerson">{translations.contactPerson[language]}</Label>
                      <Input
                        id="contactPerson"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{translations.phone[language]}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{translations.email[language]}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">{translations.message[language]}</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      {translations.submit[language]}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <Card>
          <CardContent className="p-6">
            {product.features && product.features[language] && product.features[language].length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">{translations.features[language]}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.features[language].map((feature, index) => (
                    <div key={index} className="flex items-center py-2 border-b border-border">
                      <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetail;