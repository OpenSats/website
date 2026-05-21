import { kebabCase } from 'pliny/utils/kebabCase'
import type { Blog } from 'contentlayer/generated'

export const DEFAULT_LAYOUT = 'PostLayout'
export const SPOTLIGHT_LAYOUT = 'SpotlightLayout'

export function getBlogLayout(post: Pick<Blog, 'layout' | 'tags'>): string {
  if (post.layout) {
    return post.layout
  }

  const tags = post.tags?.map((tag) => kebabCase(tag)) ?? []
  if (tags.includes('spotlight')) {
    return SPOTLIGHT_LAYOUT
  }

  return DEFAULT_LAYOUT
}

export function isSpotlightLayout(post: Pick<Blog, 'layout' | 'tags'>): boolean {
  return getBlogLayout(post) === SPOTLIGHT_LAYOUT
}
