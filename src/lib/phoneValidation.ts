// Phone helpers for the public feedback forms.
//
// The forms let the visitor type the FULL number INCLUDING the country code
// (по умолчанию +998, но код можно поменять на любой). Поэтому здесь больше нет
// жёсткой привязки к Узбекистану — номер нормализуется к E.164: "+" и до 15
// цифр. Имена функций оставлены прежними, чтобы не трогать логику форм.

const MAX_DIGITS = 15; // E.164 maximum
const MIN_DIGITS = 8; // код страны + номер — мягкий минимум под разные регионы

// Оставляем один ведущий "+" и введённые цифры (не больше 15).
export const formatUzbekPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, MAX_DIGITS);
  return digits ? `+${digits}` : '';
};

// Guard на каждый ввод: пускаем печатать, пока не упёрлись в лимит E.164.
export const isValidUzbekPhoneLength = (value: string): boolean => {
  return value.replace(/\D/g, '').length <= MAX_DIGITS;
};

// Пригодный международный номер: 9–15 цифр.
export const validateUzbekPhoneNumber = (phone: string): boolean => {
  const len = phone.replace(/\D/g, '').length;
  return len >= MIN_DIGITS && len <= MAX_DIGITS;
};

// Полный номер для отправки: "+" и только цифры.
export const getFullUzbekPhoneNumber = (phone: string): string => {
  return `+${phone.replace(/\D/g, '')}`;
};

// Номер завершён, когда в нём достаточно цифр.
export const isCompleteUzbekPhone = (phone: string): boolean => {
  return validateUzbekPhoneNumber(phone);
};
