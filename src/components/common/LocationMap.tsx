import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLang } from '~/shared/i18n/i18n-provider';

const LocationMap: React.FC = () => {
  const language = useLang() || 'ru';

  // Tashkent, Amir Temur Square coordinates
  const latitude = 41.316163;
  const longitude = 69.301548;
  
  const content = {
    ru: {
      title: 'Med Service Centre',
      address: 'Узбекистан, Ташкент, ул. Асака, 32',
      description: 'Наш офис находится по адресу: ул. Асака, 32',
      openInMaps: 'Открыть в картах',
      getDirections: 'Построить маршрут'
    },
    en: {
      title: 'Med Service Centre', 
      address: 'Uzbekistan, Tashkent, Asaka St., 32',
      description: 'Our office is located at Asaka St., 32',
      openInMaps: 'Open in Maps',
      getDirections: 'Get Directions'
    },
    uz: {
      title: 'Med Service Centre',
      address: 'O\'zbekiston, Toshkent, Asaka ko\'chasi, 32', 
      description: 'Bizning ofisimiz Asaka ko\'chasi, 32 da joylashgan',
      openInMaps: 'Xaritada ochish',
      getDirections: 'Yo\'lni ko\'rsatish'
    }
  };
  
  const currentContent = content[language as 'ru' | 'en' | 'uz'] || content['ru'];

  const handleOpenInMaps = () => {
    // Open Yandex Maps at the specific coordinates
    const yandexUrl = `https://yandex.uz/maps/?ll=${longitude},${latitude}&z=17&pt=${longitude},${latitude}`;
    window.open(yandexUrl, '_blank', 'noopener,noreferrer');
  };

  const handleGetDirections = () => {
    // Open Yandex Maps with directions to the coordinates from current location
    const yandexDirectionsUrl = `https://yandex.uz/maps/?rtext=~${latitude},${longitude}&rtt=auto`;
    window.open(yandexDirectionsUrl, '_blank', 'noopener,noreferrer');
  };

  // Язык виджета Яндекс.Карт (uz недоступен в виджете — фолбэк на ru)
  const mapLang = language === 'en' ? 'en_US' : 'ru_RU';

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-[0_30px_80px_-45px_rgba(12,17,57,0.4)] border border-msc-primary/10 bg-white">
      {/* Map Container */}
      <div className="relative h-[400px] w-full">
        {/* Яндекс.Карты (embed-виджет, без API-ключа) */}
        <iframe
          src={`https://yandex.uz/map-widget/v1/?ll=${longitude},${latitude}&z=17&pt=${longitude},${latitude},pm2bl&lang=${mapLang}`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          title="Med Service Centre Location"
          className="rounded-t-2xl"
        />
        
        {/* Overlay with company info */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border/20 max-w-xs">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground mb-1">
                {currentContent.title}
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                {currentContent.address}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentContent.description}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="p-6 bg-card border-t">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleOpenInMaps}
            className="flex-1 bg-msc-primary hover:bg-msc-accent text-white"
            size="lg"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {currentContent.openInMaps}
          </Button>
          <Button 
            onClick={handleGetDirections}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            <Navigation className="w-4 h-4 mr-2" />
            {currentContent.getDirections}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;