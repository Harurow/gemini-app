/**
 * Input validation and sanitization utilities (ADR-016)
 */

// Remove HTML tags to prevent XSS
function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

// Remove control characters except newline (\n), tab (\t), carriage return (\r)
function stripControlChars(str: string): string {
  return str.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');
}

/**
 * Sanitize a string input: trim, strip HTML, strip control chars
 */
export function sanitize(str: string): string {
  return stripControlChars(stripHtml(str.trim()));
}

/**
 * Sanitize and enforce max length
 */
export function sanitizeWithLimit(str: string, maxLength: number): string {
  const sanitized = sanitize(str);
  return sanitized.slice(0, maxLength);
}

// Limits
export const LIMITS = {
  name: 100,
  description: 500,
  prompt: 10000,
  steps: 10000,
  systemInstruction: 10000,
  apiKey: 256,
} as const;

/**
 * Validate required field (non-empty after trim)
 */
export function isRequired(value: string | undefined | null): boolean {
  return !!value && value.trim().length > 0;
}

/**
 * Validate JSON string
 */
export function isValidJson(str: string): boolean {
  if (!str.trim()) return true; // empty is valid (means no config)
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}
