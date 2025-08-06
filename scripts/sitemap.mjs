import { generateSitemap } from 'pliny/utils/generate-sitemap.js'
import siteMetadata from '../data/siteMetadata.js'

const sitemap = async () => {
  try {
    const { allBlogs } = await import('../.contentlayer/generated/index.mjs')
    generateSitemap(siteMetadata.siteUrl, allBlogs)
    console.log('Sitemap generated...')
  } catch (error) {
    console.log(
      'Sitemap generation skipped due to contentlayer import error...'
    )
  }
}
export default sitemap
