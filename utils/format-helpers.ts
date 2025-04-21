/**
 * Format the help needed section for a report
 * @param helpNeeded The help needed text
 * @returns Formatted help needed section or empty string if no help needed
 */
export function formatHelpNeededSection(helpNeeded?: string): string {
  return helpNeeded ? `## Help Needed\n${helpNeeded}` : ''
} 