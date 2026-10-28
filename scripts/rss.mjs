import { generateRSS } from 'pliny/utils/generate-rss.js'
import siteMetadata from '../data/siteMetadata.js'
import { loadContentCollection } from './lib/og-network.mjs'

const rss = async () => {
  const allBlogs = await loadContentCollection('Blog')

  generateRSS(siteMetadata, allBlogs)
  console.log('RSS feed generated...')
}

export default rss
