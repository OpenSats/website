import { writeFileSync } from 'fs'
import { stripMarkdownForSearch } from '../utils/relatedPosts.ts'
import { loadContentCollection } from './lib/og-network.mjs'

const search = async () => {
  const allBlogs = await loadContentCollection('Blog')

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
