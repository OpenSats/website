// Shared by the generator and SEO so every local social URL has a matching file.
export function blogOgImagePath(slug: string, index: number) {
  return `/static/images/blog/og/${slug}-${index}.jpg`
}

export function isLocalImage(image: string) {
  return image.startsWith('/') && !image.startsWith('//')
}
