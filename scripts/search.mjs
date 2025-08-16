import { writeFileSync, readFileSync } from 'fs'
import { allCoreContent } from 'pliny/utils/contentlayer.js'
import siteMetadata from '../data/siteMetadata.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const search = async () => {
  // Read the blog data directly from the JSON file
  const blogDataPath = join(
    __dirname,
    '../.contentlayer/generated/Blog/_index.json'
  )
  const allBlogs = JSON.parse(readFileSync(blogDataPath, 'utf8'))

  if (siteMetadata?.search?.kbarConfig?.searchDocumentsPath) {
    writeFileSync(
      `public/${siteMetadata.search.kbarConfig.searchDocumentsPath}`,
      JSON.stringify(allCoreContent(allBlogs))
    )
    console.log('Local search index generated...')
  }
}

export default search
