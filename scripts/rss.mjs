import { generateRSS } from 'pliny/utils/generate-rss.js'
import siteMetadata from '../data/siteMetadata.js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const rss = async () => {
  // Read the blog data directly from the JSON file
  const blogDataPath = join(
    __dirname,
    '../.contentlayer/generated/Blog/_index.json'
  )
  const allBlogs = JSON.parse(readFileSync(blogDataPath, 'utf8'))

  generateRSS(siteMetadata, allBlogs)
  console.log('RSS feed generated...')
}

export default rss
