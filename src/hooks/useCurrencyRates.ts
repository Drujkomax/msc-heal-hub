import { useState, useEffect } from 'react';

interface CurrencyRate {
  USD: number;
  EUR: number;
  lastUpdated: string;
}

export const useCurrencyRates = () => {
  const [rates, setRates] = useState<CurrencyRate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Кэш в localStorage на 6 часов: раньше КАЖДЫЙ визит каталога/карточки тянул
    // полный архив курсов ЦБ РУз (~25KB gzip, внешний домен) и блокировал цены.
    const CACHE_KEY = 'msc_cbu_rates_v1';
    const CACHE_TTL = 6 * 60 * 60 * 1000;

    const readCache = (): CurrencyRate | null => {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const cached = JSON.parse(raw) as CurrencyRate;
        if (Date.now() - new Date(cached.lastUpdated).getTime() > CACHE_TTL) return null;
        return cached;
      } catch {
        return null;
      }
    };

    const fetchRates = async () => {
      const cached = readCache();
      if (cached) {
        setRates(cached);
        setError(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Точечные запросы вместо полного архива (два ответа по ~300 байт)
        const [usdRes, eurRes] = await Promise.all([
          fetch('https://cbu.uz/oz/arkhiv-kursov-valyut/json/USD/'),
          fetch('https://cbu.uz/oz/arkhiv-kursov-valyut/json/EUR/'),
        ]);
        if (!usdRes.ok || !eurRes.ok) throw new Error('Failed to fetch rates');
        const [usdData, eurData] = await Promise.all([usdRes.json(), eurRes.json()]);
        const usd = parseFloat(usdData?.[0]?.Rate);
        const eur = parseFloat(eurData?.[0]?.Rate);
        if (!usd || !eur) throw new Error('Currency rates not found');

        const fresh: CurrencyRate = { USD: usd, EUR: eur, lastUpdated: new Date().toISOString() };
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(fresh)); } catch { /* private mode */ }
        setRates(fresh);
        setError(null);
      } catch (err) {
        console.error('Error fetching currency rates:', err);
        // Fallback rates if API fails
        setRates({
          USD: 12700,
          EUR: 13500,
          lastUpdated: new Date().toISOString()
        });
        setError(err instanceof Error ? err.message : 'Failed to fetch rates');
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    // Refresh rates every hour (кэш сам истечёт через TTL)
    const interval = setInterval(fetchRates, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const convertToUZS = (priceString: string | number, currency: 'USD' | 'EUR' | 'UZS'): number => {
    if (currency === 'UZS') {
      const value = typeof priceString === 'string' ? priceString.replace(/\s+/g, '') : String(priceString);
      return parseFloat(value) || 0;
    }
    
    if (!rates) return 0;
    
    // Clean the price string - remove all spaces
    const cleanPrice = typeof priceString === 'string' ? priceString.replace(/\s+/g, '') : String(priceString);
    const priceNumber = parseFloat(cleanPrice);
    
    if (isNaN(priceNumber)) return 0;
    
    // Multiply by exchange rate
    const convertedAmount = priceNumber * rates[currency];
    
    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
  };

  const formatPrice = (amount: string | null, currency: 'USD' | 'EUR' | 'UZS'): string => {
    if (!amount) return '';
    // Remove spaces from price string before parsing
    const cleanAmount = amount.replace(/\s+/g, '');
    const numAmount = parseFloat(cleanAmount);
    if (isNaN(numAmount)) return '';
    
    if (currency === 'UZS') {
      return numAmount.toLocaleString('ru-RU');
    }
    return numAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return {
    rates,
    loading,
    error,
    convertToUZS,
    formatPrice
  };
};
