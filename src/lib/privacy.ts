/**
 * Contact Information Privacy Utilities
 * Mandate: Contact numbers and emails must be hidden from everyone.
 */

// Email regex pattern
export const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;

// Phone number regex pattern matching international and national formats (7 to 15 digits)
export const PHONE_PATTERN = /(?:(?:\+?\d{1,4}[-.\s()]*)?(?:\(?\d{2,4}\)?[-.\s()]*)?\d{3,4}[-.\s()]*\d{3,4}(?:[-.\s()]*\d{1,4})?|\b\d{7,15}\b)/g;

// Obfuscated spaced-out digits (e.g., "0 8 2 1 2 3 4 5 6 7")
export const SPACED_PHONE_PATTERN = /(?:\b\d[\s.-]){6,}\d\b/g;

/**
 * Checks if the text contains an email address.
 */
export function hasEmail(text: string): boolean {
  if (!text) return false;
  const regex = new RegExp(EMAIL_PATTERN.source, 'gi');
  return regex.test(text);
}

/**
 * Checks if the text contains a contact/phone number (7 to 15 digits).
 */
export function hasPhone(text: string): boolean {
  if (!text) return false;
  const spacedRegex = new RegExp(SPACED_PHONE_PATTERN.source, 'g');
  if (spacedRegex.test(text)) return true;

  const phoneRegex = new RegExp(PHONE_PATTERN.source, 'g');
  const matches = text.match(phoneRegex);
  if (!matches) return false;

  return matches.some((m) => {
    const digits = m.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  });
}

/**
 * Checks if text contains either contact number or email address.
 */
export function hasContactInfo(text: string): boolean {
  if (!text) return false;
  return hasEmail(text) || hasPhone(text);
}

/**
 * Masks all emails and contact numbers from the provided string.
 */
export function maskContactInfo(text: string): string {
  if (!text) return text;

  // 1. Mask emails
  let masked = text.replace(EMAIL_PATTERN, '[Email hidden for privacy]');

  // 2. Mask spaced out phone numbers (e.g. 0 8 2 4 5 9 9 0 2 1)
  masked = masked.replace(SPACED_PHONE_PATTERN, '[Contact number hidden for privacy]');

  // 3. Mask standard phone numbers where digit count is between 7 and 15
  masked = masked.replace(PHONE_PATTERN, (match) => {
    const digits = match.replace(/\D/g, '');
    if (digits.length >= 7 && digits.length <= 15) {
      return '[Contact number hidden for privacy]';
    }
    return match;
  });

  return masked;
}
