import type { Project, Blog, Fund, Topic } from 'contentlayer/generated'

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Finds blog posts whose title, summary, tags, or body mention any of the
 * given terms as a whole word (case-insensitive).
 *
 * Internal separators in a term (whitespace, hyphen, underscore) are treated
 * as interchangeable, so a term like "BIP 324" matches "BIP 324", "BIP-324",
 * "BIP_324", and "BIP324" in blog text. Word boundaries still anchor both
 * ends, so "BIP 32" does not match "BIP 324".
 */
export function getRelatedBlogPostsByTerms(
  terms: string[],
  blogs: Blog[]
): Blog[] {
  const patterns = Array.from(
    new Set(
      terms
        .map((t) => (t || '').trim().toLowerCase())
        .filter((t) => t.length > 0)
    )
  )
    .map((t) =>
      t
        .split(/[^a-z0-9]+/)
        .filter(Boolean)
        .map(escapeRegExp)
    )
    .filter((tokens) => tokens.length > 0)
    .map((tokens) => new RegExp(`\\b${tokens.join('[\\s\\-_]*')}\\b`, 'i'))

  if (patterns.length === 0) return []

  return blogs.filter((blog) => {
    const haystack = [
      blog.title || '',
      blog.summary || '',
      (blog.tags || []).join(' '),
      blog.body?.raw || '',
    ]
      .join(' ')
      .toLowerCase()
    return patterns.some((p) => p.test(haystack))
  })
}

/**
 * Finds blog posts that mention a given project by title or slug.
 */
export function getRelatedBlogPostsForProject(
  project: Project,
  blogs: Blog[]
): Blog[] {
  const title = project.title
  const slug = project.slug.split('/').pop() || project.slug
  return getRelatedBlogPostsByTerms([title, slug], blogs)
}

/**
 * Finds blog posts that mention a given topic by its title or any alias.
 */
export function getRelatedBlogPostsForTopic(
  topic: Topic,
  blogs: Blog[]
): Blog[] {
  return getRelatedBlogPostsByTerms(
    [topic.title, ...(topic.aliases || [])],
    blogs
  )
}

// Map fund slugs to the tags that should be considered "related" for announcements
const FUND_TAGS_BY_SLUG: Record<string, string[]> = {
  nostr: ['nostr'],
  general: ['bitcoin'],
  ops: ['funding'],
}

/**
 * Finds blog posts that are related to a given fund by matching tags.
 *
 * This uses a simple mapping from fund slug to one or more tags and then
 * returns all blog posts that share at least one of those tags.
 */
export function getRelatedBlogPostsForFund(fund: Fund, blogs: Blog[]): Blog[] {
  if (!fund) return []

  const slug = fund.slug.split('/').pop() || fund.slug
  const relatedTags = (FUND_TAGS_BY_SLUG[slug] || []).map((t) =>
    t.toLowerCase()
  )
  if (!relatedTags.length) return []

  return blogs.filter((blog) => {
    const blogTags = (blog.tags || []).map((t) => t.toLowerCase())
    return blogTags.some((tag) => relatedTags.includes(tag))
  })
}

/**
 * Returns the primary "related" tag for a fund (the first tag mapped in
 * FUND_TAGS_BY_SLUG), suitable for linking to the corresponding /tags/<tag>
 * archive page. Returns null when no mapping exists.
 */
export function getFundPrimaryTag(fund: Fund): string | null {
  if (!fund) return null
  const slug = fund.slug.split('/').pop() || fund.slug
  const tags = FUND_TAGS_BY_SLUG[slug]
  return tags?.[0]?.toLowerCase() ?? null
}
