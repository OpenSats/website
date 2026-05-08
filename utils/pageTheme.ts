export type SiteTheme = 'default' | 'nostr'

const yearInReviewNostrSlugs = new Set([
  '2023-year-in-review',
  '2024-year-in-review',
  '2025-year-in-review',
])

export function getBasePageTheme(pageTheme?: string): SiteTheme {
  return pageTheme === 'nostr' ? 'nostr' : 'default'
}

export function getBlogPageTheme(tags: string[] = []): SiteTheme {
  return tags.includes('nostr') && !tags.includes('bitcoin')
    ? 'nostr'
    : 'default'
}

export function getHashThemeOverride(
  slug?: string,
  hash?: string
): SiteTheme | null {
  if (hash !== '#nostr-the-nostr-fund') {
    return null
  }

  return slug && yearInReviewNostrSlugs.has(slug) ? 'nostr' : null
}
