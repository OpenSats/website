import { writeFileSync } from 'fs'
import globby from 'globby'
import prettier from 'prettier'
import siteMetadata from '../data/siteMetadata.js'
import { loadContentCollection } from './lib/og-network.mjs'

const sitemap = async () => {
  const allBlogs = await loadContentCollection('Blog')
  const contentPages = allBlogs
    .filter((post) => !post.draft && !post.canonicalUrl)
    .map((post) => `/${post._raw.flattenedPath}`)
  const pages = await globby([
    'pages/*.(js|tsx)',
    'public/tags/**/*.xml',
    '!pages/_*.(js|tsx)',
    '!pages/api',
    '!pages/404.(js|tsx)',
  ])
  const urls = pages.concat(contentPages).map((page) => {
    const path = page
      .replace('pages/', '/')
      .replace('public/', '/')
      .replace(/\.js|.tsx|.mdx|.md[^/.]+$/, '')
      .replace('/feed.xml', '')
    const route = path === '/index' ? '' : path
    return `<url><loc>${siteMetadata.siteUrl}${route}</loc></url>`
  })
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls.join('')}
    </urlset>`
  const prettierConfig = await prettier.resolveConfig('./.prettierrc.js')
  const formatted = await prettier.format(xml, {
    ...prettierConfig,
    parser: 'html',
  })

  writeFileSync('public/sitemap.xml', formatted)
  console.log('Sitemap generated...')
}

export default sitemap
