/**
 * Utility functions for sanitizing user input
 */

/**
 * Sanitizes a string input by removing potentially dangerous characters
 * and limiting its length
 * 
 * @param input The string to sanitize
 * @param maxLength Maximum allowed length (default: 5000)
 * @returns Sanitized string
 */
export function sanitizeString(input: string, maxLength: number = 5000): string {
  if (!input) return '';
  
  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Limit length
    .slice(0, maxLength);
}

/**
 * Sanitizes an email address
 * 
 * @param email Email address to sanitize
 * @returns Sanitized email address or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  const sanitized = email.trim().toLowerCase();
  
  if (!emailRegex.test(sanitized)) {
    return '';
  }
  
  return sanitized;
}

/**
 * Sanitizes a grant ID
 * 
 * @param grantId Grant ID to sanitize
 * @returns Sanitized grant ID or empty string if invalid
 */
export function sanitizeGrantId(grantId: string): string {
  if (!grantId) return '';
  
  // Grant IDs are 6-7 digit numbers
  const grantIdRegex = /^\d{6,7}$/;
  
  const sanitized = grantId.trim();
  
  if (!grantIdRegex.test(sanitized)) {
    return '';
  }
  
  return sanitized;
}

/**
 * Sanitizes report content by removing potentially dangerous elements
 * while preserving valid Markdown
 * 
 * @param content Markdown content to sanitize
 * @param maxLength Maximum allowed length (default: 50000)
 * @returns Sanitized Markdown content
 */
export function sanitizeMarkdown(content: string, maxLength: number = 50000): string {
  if (!content) return '';
  
  return content
    .trim()
    // Remove script tags and their contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove on* attributes (onclick, onload, etc.)
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    // Limit length
    .slice(0, maxLength);
}
