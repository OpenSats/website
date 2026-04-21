import type { Project, Blog, Fund, Topic } from 'contentlayer/generated'

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Finds blog posts whose title, summary, tags, or body mention any of the
 * given terms as a whole word (case-insensitive).
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
  ).map((t) => new RegExp(`\\b${escapeRegExp(t)}\\b`, 'i'))

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
  return getRelatedBlogPostsByTerms([topic.title, ...(topic.aliases || [])], blogs)
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
