import { generateRSS } from 'pliny/utils/generate-rss.js'
import siteMetadata from '../data/siteMetadata.js'

const rss = async () => {
  try {
    const { allBlogs } = await import('../.contentlayer/generated/index.mjs')
    generateRSS(siteMetadata, allBlogs)
    console.log('RSS feed generated...')
  } catch (error) {
    console.log(
      'RSS feed generation skipped due to contentlayer import error...'
    )
  }
}
export default rss
