import { writeFileSync } from 'fs'
import { allCoreContent } from 'pliny/utils/contentlayer.js'
import siteMetadata from '../data/siteMetadata.js'

const search = async () => {
  try {
    const { allBlogs } = await import('../.contentlayer/generated/index.mjs')
    if (siteMetadata?.search?.kbarConfig?.searchDocumentsPath) {
      writeFileSync(
        `public/${siteMetadata.search.kbarConfig.searchDocumentsPath}`,
        JSON.stringify(allCoreContent(allBlogs))
      )
      console.log('Local search index generated...')
    }
  } catch (error) {
    console.log(
      'Search index generation skipped due to contentlayer import error...'
    )
  }
}
export default search
