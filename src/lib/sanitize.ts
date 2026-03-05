/**
 * Simple input sanitization utilities.
 * No external dependencies required.
 */

/**
 * Strip all HTML tags from a string.
 * Preserves the text content within tags.
 */
export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Escape HTML special characters to prevent XSS when rendering user input.
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  return input.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Remove null bytes and other dangerous control characters,
 * keeping standard whitespace (tab, newline, carriage return).
 */
export function stripControlChars(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

/**
 * Sanitize a user-provided string: strip HTML tags, remove control chars, and trim.
 * Use this for plain-text inputs (names, messages, etc.).
 */
export function sanitizeInput(input: string): string {
  return stripControlChars(stripHtmlTags(input)).trim();
}
