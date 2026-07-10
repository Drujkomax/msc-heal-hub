// Form validation utilities.
// Validators return i18n KEYS (leadForm.validation.*) — the component renders
// them through t(), so error messages follow the active language.

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>; // field -> i18n key
}

export interface LeadFormData {
  name: string;
  phone: string;
  equipmentType?: string;
  company?: string;
  message?: string;
}

export interface LeadFormOptions {
  /** Force the equipment select to be filled (consultation form marks it with *). */
  requireEquipment?: boolean;
  /** Allowed equipment keys; the quote form uses its own set. */
  equipmentTypes?: string[];
}

const V = 'leadForm.validation';

export const DEFAULT_EQUIPMENT_TYPES = ['ultrasound', 'xray', 'mri', 'ct', 'lab', 'other'];

// Буквы латиницы/кириллицы, включая узбекские Ў Қ Ғ Ҳ и апострофы oʻ/gʻ (ʻ ʼ ’),
// пробелы, дефисы и точку для инициалов.
const NAME_RE = /^[a-zA-Zа-яА-ЯёЁўЎқҚғҒҳҲʻʼ'’‘\s\-.]+$/;

export const validateName = (name: string): string | null => {
  const trimmed = name.trim();
  if (!trimmed) return `${V}.nameRequired`;
  if (trimmed.length < 2) return `${V}.nameMin`;
  if (trimmed.length > 50) return `${V}.nameMax`;
  if (!NAME_RE.test(trimmed)) return `${V}.nameChars`;
  return null;
};

export const validateCompany = (company: string): string | null => {
  const trimmed = company.trim();
  if (!trimmed) return null; // company is optional
  if (trimmed.length < 2) return `${V}.companyMin`;
  if (trimmed.length > 100) return `${V}.companyMax`;
  return null;
};

export const validateMessage = (message: string): string | null => {
  if (message && message.length > 500) return `${V}.messageMax`;
  return null;
};

// Main form validation function
export const validateLeadForm = (formData: LeadFormData, options?: LeadFormOptions): ValidationResult => {
  const errors: Record<string, string> = {};
  const allowedEquipment = options?.equipmentTypes ?? DEFAULT_EQUIPMENT_TYPES;

  const nameError = validateName(formData.name);
  if (nameError) errors.name = nameError;

  // Format/completeness of the phone is checked by phoneValidation in the component.
  if (!formData.phone || !formData.phone.trim()) errors.phone = `${V}.phoneRequired`;

  if (formData.company) {
    const companyError = validateCompany(formData.company);
    if (companyError) errors.company = companyError;
  }

  if (formData.message) {
    const messageError = validateMessage(formData.message);
    if (messageError) errors.message = messageError;
  }

  if (options?.requireEquipment && !formData.equipmentType) {
    errors.equipmentType = `${V}.equipmentRequired`;
  } else if (formData.equipmentType && !allowedEquipment.includes(formData.equipmentType)) {
    errors.equipmentType = `${V}.equipmentInvalid`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Обрезает управляющие символы и ограничивает длину. НЕ экранирует HTML и НЕ
// трогает пробелы: экранирование на каждый ввод ломало узбекские имена с
// апострофом (G'ani → G&#x27;ani), а trim не давал набрать пробел между
// словами. Рендер экранирует React, в БД значения идут параметризованным SQL.
export const sanitizeInput = (input: string): string => {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '').substring(0, 200);
};
