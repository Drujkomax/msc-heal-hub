export const countries = [
  { code: 'AT', name: { ru: 'Австрия', en: 'Austria', uz: 'Avstriya' }, flag: '🇦🇹' },
  { code: 'AU', name: { ru: 'Австралия', en: 'Australia', uz: 'Avstraliya' }, flag: '🇦🇺' },
  { code: 'BE', name: { ru: 'Бельгия', en: 'Belgium', uz: 'Belgiya' }, flag: '🇧🇪' },
  { code: 'BY', name: { ru: 'Беларусь', en: 'Belarus', uz: 'Belarus' }, flag: '🇧🇾' },
  { code: 'GB', name: { ru: 'Великобритания', en: 'United Kingdom', uz: 'Buyuk Britaniya' }, flag: '🇬🇧' },
  { code: 'HU', name: { ru: 'Венгрия', en: 'Hungary', uz: 'Vengriya' }, flag: '🇭🇺' },
  { code: 'DE', name: { ru: 'Германия', en: 'Germany', uz: 'Germaniya' }, flag: '🇩🇪' },
  { code: 'DK', name: { ru: 'Дания', en: 'Denmark', uz: 'Daniya' }, flag: '🇩🇰' },
  { code: 'IL', name: { ru: 'Израиль', en: 'Israel', uz: 'Isroil' }, flag: '🇮🇱' },
  { code: 'IN', name: { ru: 'Индия', en: 'India', uz: 'Hindiston' }, flag: '🇮🇳' },
  { code: 'ES', name: { ru: 'Испания', en: 'Spain', uz: 'Ispaniya' }, flag: '🇪🇸' },
  { code: 'IT', name: { ru: 'Италия', en: 'Italy', uz: 'Italiya' }, flag: '🇮🇹' },
  { code: 'CA', name: { ru: 'Канада', en: 'Canada', uz: 'Kanada' }, flag: '🇨🇦' },
  { code: 'CN', name: { ru: 'Китай', en: 'China', uz: 'Xitoy' }, flag: '🇨🇳' },
  { code: 'NL', name: { ru: 'Нидерланды', en: 'Netherlands', uz: 'Niderlandiya' }, flag: '🇳🇱' },
  { code: 'NO', name: { ru: 'Норвегия', en: 'Norway', uz: 'Norvegiya' }, flag: '🇳🇴' },
  { code: 'UZ', name: { ru: 'Узбекистан', en: 'Uzbekistan', uz: 'O\'zbekiston' }, flag: '🇺🇿' },
  { code: 'PL', name: { ru: 'Польша', en: 'Poland', uz: 'Polsha' }, flag: '🇵🇱' },
  { code: 'PT', name: { ru: 'Португалия', en: 'Portugal', uz: 'Portugaliya' }, flag: '🇵🇹' },
  { code: 'RU', name: { ru: 'Россия', en: 'Russia', uz: 'Rossiya' }, flag: '🇷🇺' },
  { code: 'SK', name: { ru: 'Словакия', en: 'Slovakia', uz: 'Slovakiya' }, flag: '🇸🇰' },
  { code: 'US', name: { ru: 'США', en: 'United States', uz: 'AQSH' }, flag: '🇺🇸' },
  { code: 'TR', name: { ru: 'Турция', en: 'Turkey', uz: 'Turkiya' }, flag: '🇹🇷' },
  { code: 'FI', name: { ru: 'Финляндия', en: 'Finland', uz: 'Finlandiya' }, flag: '🇫🇮' },
  { code: 'FR', name: { ru: 'Франция', en: 'France', uz: 'Fransiya' }, flag: '🇫🇷' },
  { code: 'CZ', name: { ru: 'Чехия', en: 'Czech Republic', uz: 'Chexiya' }, flag: '🇨🇿' },
  { code: 'CH', name: { ru: 'Швейцария', en: 'Switzerland', uz: 'Shveytsariya' }, flag: '🇨🇭' },
  { code: 'SE', name: { ru: 'Швеция', en: 'Sweden', uz: 'Shvetsiya' }, flag: '🇸🇪' },
  { code: 'KR', name: { ru: 'Южная Корея', en: 'South Korea', uz: 'Janubiy Koreya' }, flag: '🇰🇷' },
  { code: 'JP', name: { ru: 'Япония', en: 'Japan', uz: 'Yaponiya' }, flag: '🇯🇵' },
];

export const getCountryByCode = (code: string | null) => {
  if (!code) return null;
  return countries.find(country => country.code === code);
};

export const getCountryFlag = (code: string | null) => {
  const country = getCountryByCode(code);
  return country?.flag || '';
};

export const getCountryName = (code: string | null, language: 'ru' | 'en' | 'uz') => {
  const country = getCountryByCode(code);
  return country?.name[language] || '';
};