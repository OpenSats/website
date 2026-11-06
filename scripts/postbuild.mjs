import rss from './rss.mjs'
import sitemap from './sitemap.mjs'
import search from './search.mjs'

async function postbuild() {
  await rss()
  await Promise.all([sitemap(), search()])
}

postbuild()
