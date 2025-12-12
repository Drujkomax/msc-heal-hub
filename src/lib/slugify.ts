/**
 * Generate a URL-friendly slug from text
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export const generateSlug = (text: string): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
};

/**
 * Generate a unique slug by appending a suffix if needed
 * @param text - The text to convert to a slug
 * @param suffix - Optional suffix to ensure uniqueness (e.g., first 8 chars of UUID)
 * @returns A unique URL-friendly slug
 */
export const generateUniqueSlug = (text: string, suffix?: string): string => {
  const baseSlug = generateSlug(text);
  if (!baseSlug) return suffix || '';
  if (suffix) {
    return `${baseSlug}-${suffix}`;
  }
  return baseSlug;
};
