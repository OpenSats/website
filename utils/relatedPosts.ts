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

  return blogs.filter((blog) => {
    // Build searchable content from all relevant fields
    const searchContent = [
      blog.title || '',
      blog.summary || '',
      (blog.tags || []).join(' '),
      blog.body?.raw || '',
    ]
      .join(' ')
      .toLowerCase()

    // Check if project title or slug appears in the content
    return (
      searchContent.includes(projectTitle) ||
      (projectSlug && searchContent.includes(projectSlug))
    )
  })
}

