import type { Project, Blog } from 'contentlayer/generated'

/**
 * Finds blog posts that mention a given project by searching through
 * title, summary, tags, and body content.
 */
export function getRelatedBlogPostsForProject(
  project: Project,
  blogs: Blog[]
): Blog[] {
  const projectTitle = project.title.toLowerCase()
  const projectSlug = project.slug?.toLowerCase() || ''

  // Escape special regex characters and create word boundary patterns
  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const projectTitlePattern = new RegExp(`\\b${escapeRegex(projectTitle)}\\b`, 'i')
  const projectSlugPattern = projectSlug
    ? new RegExp(`\\b${escapeRegex(projectSlug)}\\b`, 'i')
    : null

  return blogs.filter((blog) => {
    // Build searchable content from all relevant fields
    const searchContent = [
      blog.title || '',
      blog.summary || '',
      (blog.tags || []).join(' '),
      blog.body?.raw || '',
    ]
      .join(' ')

    // Check if project title or slug appears as whole words in the content
    return (
      projectTitlePattern.test(searchContent) ||
      (projectSlugPattern && projectSlugPattern.test(searchContent))
    )
  })
}

