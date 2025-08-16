import { generateSitemap } from 'pliny/utils/generate-sitemap.js'
import siteMetadata from '../data/siteMetadata.js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const sitemap = async () => {
  // Read the blog data directly from the JSON file
  const blogDataPath = join(
    __dirname,
    '../.contentlayer/generated/Blog/_index.json'
  )
  const allBlogs = JSON.parse(readFileSync(blogDataPath, 'utf8'))

  generateSitemap(siteMetadata.siteUrl, allBlogs)
  console.log('Sitemap generated...')
}

export default sitemap
