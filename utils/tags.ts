import { slug } from 'github-slugger'
import type { Blog } from 'contentlayer/generated'

export function getAllTags(posts: Pick<Blog, 'tags' | 'draft'>[]) {
  const counts: Record<string, number> = {}
  for (const post of posts) {
    if (post.draft === true) continue
    for (const tag of post.tags || []) {
      const key = slug(tag)
      counts[key] = (counts[key] || 0) + 1
    }
  }
  return counts
}
