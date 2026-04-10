import type { Project, Blog, Fund } from 'contentlayer/generated'

/**
 * Finds blog posts that mention a given project by searching through
 * title, summary, tags, and body content.
 */
export function getRelatedBlogPostsForProject(
  project: Project,
  blogs: Blog[]
): Blog[] {
  const projectTitle = project.title.toLowerCase()
  const projectSlug = (
    project.slug.split('/').pop() || project.slug
  ).toLowerCase()

  const slugPattern =
    projectSlug !== projectTitle
      ? new RegExp(`\\b${escapeRegExp(projectSlug)}\\b`, 'i')
      : null

  return blogs.filter((blog) => {
    const searchContent = [
      blog.title || '',
      blog.summary || '',
      (blog.tags || []).join(' '),
      blog.body?.raw || '',
    ]
      .join(' ')
      .toLowerCase()

    const titlePattern = new RegExp(`\\b${escapeRegExp(projectTitle)}\\b`)
    if (titlePattern.test(searchContent)) return true
    if (slugPattern && slugPattern.test(searchContent)) return true
    return false
  })
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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
