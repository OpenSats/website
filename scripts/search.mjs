import { writeFileSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { stripMarkdownForSearch } from '../utils/relatedPosts.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const search = async () => {
  const blogDataPath = join(
    __dirname,
    '../.contentlayer/generated/Blog/_index.json'
  )
  const allBlogs = JSON.parse(readFileSync(blogDataPath, 'utf8'))

  const index = Object.fromEntries(
    allBlogs.map((post) => [
      post.slug,
      stripMarkdownForSearch(post.body?.raw || ''),
    ])
  )

  writeFileSync('public/search.json', JSON.stringify(index))
  console.log('Local search index generated...')
}

export default search
